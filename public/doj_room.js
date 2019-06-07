'use strict';

/*
window.ondragover = function(ev){
	if (g_stt.IsDsbl_Image()) { return; }

	ev.preventDefault();
//	ev.stopPropagation();
	ev.dataTransfer.dropEffect = 'copy';
//	ev.dataTransfer.effectAllowed = 'move';
};

window.ondrop = (ev) => {
	if (g_stt.IsDsbl_Image()) { return; }

	ev.preventDefault();
	ev.stopPropagation();

	const files = ev.dataTransfer.files;
	if (files.length > 1) { return; }
	
	g_DBG(ev);	
};
*/

////////////////////////////////////////////////////////////////

const Doj_Room = function() {
	// .Init() で設定される
	let m_room_ID;
	this.Get_RmID = () => m_room_ID;
	let m_doj_room_info;
	this.Get_doj_RI = () => m_doj_room_info;
	this.Get_HostID = () => m_doj_room_info.Get_HostID();

	// サーバーに処理を emit した後は、その処理が終わるまで、ユーザーの操作を受け付けないようにする
	// サーバーのキューに処理がたまらないようにするため
	let m_bDsbl_Oprtn = false;

	// 現在の画面が、部屋の中か、ロビーであるか、このフラグで判断
	let m_bOpen = false;
	this.IsOpen = () => m_bOpen;

	// -------------------------------------
	const m_e_input_voice = document.createElement('textarea');
	m_e_input_voice.classList.add('doj_room_input_voice');
	m_e_input_voice.placeholder = 'ここに、あなたのメッセージを入力してください。';
	// 漢字変換用のエンターキーの入力判定に適しているのは、keypress時
	m_e_input_voice.onkeypress = (ev) => {
		if (!m_bDsbl_Oprtn && m_e_input_voice.value.trim().length > 0) {
			if (ev.key === 'Enter') {
				ev.preventDefault();
				OnClick_Issue.bind(this)();
			}
		}
	};
	m_e_input_voice.onkeyup = () => {
		if (m_bDsbl_Oprtn || m_e_input_voice.value.trim().length == 0) {
			m_e_btn_issue.disabled = true;
		} else {
			m_e_btn_issue.disabled = false;
		}
	};

	// -------------------------------------
	const m_e_area_fn = document.createElement('div');
	m_e_area_fn.classList.add('doj_room_fn_area');

	const m_e_cnctlamp = document.createElement('div');
	m_e_cnctlamp.textContent = '通信中';
	m_e_cnctlamp.classList.add('doj_room_cnctlamp');
	m_e_area_fn.appendChild(m_e_cnctlamp);

	const m_e_btn_issue = document.createElement('button');
	m_e_btn_issue.textContent = '発言する';
	m_e_btn_issue.classList.add('btn_e_d_effect');
	m_e_btn_issue.classList.add('doj_room_btn_left');
	m_e_btn_issue.onclick = OnClick_Issue.bind(this);
	m_e_area_fn.appendChild(m_e_btn_issue);

	const m_e_btn_secret = document.createElement('button');
	m_e_btn_secret.textContent = '内緒';
	m_e_btn_secret.classList.add('btn_e_d_effect');
	m_e_btn_secret.classList.add('doj_room_btn_left');
	m_e_area_fn.appendChild(m_e_btn_secret);

	const m_e_btn_fmsg = document.createElement('button');
	m_e_btn_fmsg.textContent = '固定メッセージ';
	m_e_btn_fmsg.classList.add('btn_e_d_effect');
	m_e_btn_fmsg.classList.add('doj_room_btn_left');
	m_e_area_fn.appendChild(m_e_btn_fmsg);

	const m_e_btn_exit = document.createElement('button');
	m_e_btn_exit.textContent = '退室する';
	m_e_btn_exit.classList.add('btn_e_d_effect');
	m_e_btn_exit.classList.add('doj_room_btn_rigth');
	m_e_btn_exit.onclick = Close.bind(this);
	m_e_area_fn.appendChild(m_e_btn_exit);

	// -------------------------------------
	const e_lump = document.createElement('div');
	e_lump.style.width = '100%';
	e_lump.appendChild(m_e_input_voice);
	e_lump.appendChild(m_e_area_fn);
	e_lump.hidden = true;  // 初期状態は非表示

	this.e_lump = e_lump;

	// -------------------------------------
	function OnClick_Issue() {
		const umsg = m_e_input_voice.value.trim();
//		if (umsg.length == 0) { return; }

		// ▶ リカバリ巻数の実装が必要
		this.Dsbl_Oprtn(null, 0);

		// [roomID, uID, str]
		const my_uID = g_doj_crt_usr.Get_uID();
		g_socketio.emit('UP_umsg', [m_room_ID, my_uID, umsg]);

		// 同室者には DN_umsg が送信されるので、自分の部屋の分だけを更新する
		// Doj_Vc_umsg は、new するだけで、自分で g_Room_Voices.AddVoice() をコールしてくれる
		new Doj_Vc_umsg(m_doj_room_info, my_uID, umsg);

		m_e_input_voice.value = '';

		// サーバーの処理が終了したことを確認した後、ユーザーの次の操作を許可する

g_DBG_F('OnClick_Issue.g_Wait_NS');

		g_Wait_NodeSvr.Set(this, this.Enbl_Oprtn, 'Doj_Room.OnClick_Issue()');
	}

	this.ISet_doj_Fmsg = (doj_Fmsg) => {
		m_e_btn_fmsg.onclick = doj_Fmsg.Toggle.bind(doj_Fmsg);
	};

	////////////////////////////////////////
	// メソッド
	this.Show = () => {
		g_doj_fixd_msg.Hide();
		this.e_lump.hidden = false;
	};
	this.Hide = () => {
		g_doj_fixd_msg.Hide();
		this.e_lump.hidden = true;
	};

	// 処理が失敗した場合にそなえて、コールバック関数を登録できる
	// 現在は未実装
	this.Dsbl_Oprtn = (fn, sec) => {
		// 通信中の表示
		m_e_cnctlamp.classList.add('doj_room_cnctlamp_on');

		m_bDsbl_Oprtn = true;
		m_e_btn_issue.disabled = true;
		m_e_btn_secret.disabled = true;
		m_e_btn_exit.disabled = true;
	}
	this.Enbl_Oprtn = () => {
		// 表示を通信処理終了に戻す
		m_e_cnctlamp.classList.remove('doj_room_cnctlamp_on');

		m_bDsbl_Oprtn = false;
		if (m_e_input_voice.value.trim().length > 0) {
			m_e_btn_issue.disabled = false;
		} else {
			m_e_btn_issue.disabled = true;
		}
		m_e_btn_secret.disabled = false;
		m_e_btn_exit.disabled = false;
	}

	// a_svl は、[[uID, type, contents], ...]
	// このメソッドは、入室する前に呼び出されることを想定している。
	// Init() の後に、「さんが入室しました」の処理を行うこと。
	this.Init = (doj_room_info, a_svl) => {
		m_room_ID = doj_room_info.Get_RoomID();
		m_doj_room_info = doj_room_info;

		// View
		m_e_input_voice.textContent = '';
		m_e_btn_issue.disabled = true;

		// 戻り値は、true or false
		return g_Room_Voices.Init(doj_room_info, a_svl);
	};


	// -----------------------------------------
	// g_doj_WaitScrn.Show() の状態で、このメソッドがコールされる
	this.Open_AsHost = (doj_RI) => {
		m_bOpen = true;

		// Init() は、入室する前に呼び出されることを想定している。
		// ホストで部屋を作ったということは、まだ voice は空ということ。
		this.Init(doj_RI, [[], -1]);

		// SVL は記録済み
		g_Room_Voices.Add_EntVc_uname(g_doj_crt_usr.Get_uname());

		// WaitScrn を解除
//		g_doj_WaitScrn.Hide();
//		this.Show();

		// サーバーの準備が整うまで、操作ができないようにしておく
//		this.Dsbl_Oprtn();
		// サーバーの準備が整ったことを確認した後、this.Enbl_Oprtn() を実行する

g_DBG_F('Open_AsHost.g_Wait_NS');

		g_Wait_NodeSvr.Set(this, this.Enbl_Oprtn, 'Doj_Room.Open_AsHost()');
	}

	// -----------------------------------------
	// g_doj_WaitScrn.Show() の状態で、このメソッドがコールされる
	this.Open_AsGuest = (doj_RI, a_svl) => {
		m_bOpen = true;

		// Init() は、入室する前に呼び出されることを想定している。
		// a_svl には、すでに自分が入室した胸の voice が含まれていることに注意
		if (this.Init(doj_RI, a_svl) === true) {
			this.Open_AsGuest_Fnlz();
		}
	}

	this.Open_AsGuest_Fnlz = () => {
		g_doj_fixd_msg.Init_AsGuest(m_room_ID);

g_DBG_F('Open_AsGuest.g_Wait_NS');

		// サーバーの準備が整ったことを確認した後、this.Enbl_Oprtn() を実行する
		g_Wait_NodeSvr.Set(this, this.Enbl_Oprtn, 'Doj_Room.Open_AsGuest()');	
	}

	// ------------------------------------
	function Close() {
		m_bOpen = false;

		// ▶ リカバリ関数の実装が必要
		this.Dsbl_Oprtn(null, 0);

		const uID = g_doj_crt_usr.Get_uID();
		g_socketio.emit('UP_rmvMe', [m_room_ID, uID]);
		// 送信者（自分）には、DN_rmvUsr が送信されないため、自分で削除を実行する
		m_doj_room_info.RemoveUsr(uID);

		// 全ユーザに影響を与えるため、まずは、既に発行されている処理を終えてから Close処理を実行する
		g_Wait_NodeSvr.Set(this, this.Close_fnlz, 'Doj_Room.Close');
	};
	
	this.Close_fnlz = () => {
		this.Enbl_Oprtn();

		// doj_room をクローズし、ロビーを表示する
		this.Hide();
		g_Room_Voices.Purge();
		g_doj_fixd_msg.Hide();

		g_view_Lobby.Show();
	};
};

// デバッグ用
Doj_Room.prototype.toString = () => 'Doj_Room object';

