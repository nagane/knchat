'use strict';

const c_MAX_Voices = 100;


////////////////////////////////////////////////////////////////
// ボイスの基底
function Doj_Smpl_Vc_SysMsg(msg) {
	let m_ix_SVL = null;
	this.Set_ix_SVL = (ix_SVL) => { m_ix_SVL = ix_SVL; };  // AddVoice() からコールされる

	const e_lump = document.createElement('div');
	e_lump.classList.add('vc_sys_msg');
	e_lump.textContent = msg;

	this.e_lump = e_lump;
}
Doj_Smpl_Vc_SysMsg.prototype.Get_uID = () => -1;
Doj_Smpl_Vc_SysMsg.prototype.Resize = () => {};


////////////////////////////////////////////////////////////////
// 以下の「Doj_Vc_」においては、
// 1. uname, uview が不明な場合、IsComplete() で false が返される
//　　この場合は、後で、Completion() をコールして、処理を完成させる必要がある
// 2. uname, uview が分かり、vc が完全に処理された場合は IsComplete() で true が返される
// 3. Doj_Vc_ 内において、g_Room_Voices.AddVoice() のコールが実行される

// vc_type は IX_VcTYPE_txt 未満
function Doj_Vc_SysMsg(doj_RI, uID, vc_type) {
	const m_uID = uID;
	this.Get_uID = () => m_uID;  // incomplete であった場合に、uID が必要となる

	let m_bIsCmplt = null;
	this.IsComplete = () => m_bIsCmplt;

	let m_ix_SVL = null;
	this.Set_ix_SVL = (ix_SVL) => { m_ix_SVL = ix_SVL; };  // AddVoice() からコールされる

	// Completion() でのみ利用される
	const m_vc_type = vc_type;

	const e_lump = document.createElement('div');
	e_lump.classList.add('vc_sys_msg');

	////////////////////////////////////////
	this.Completion = (uname, uview) => {
		m_bIsCmplt = true;

		switch (m_vc_type) {
			case IX_VcTYPE_enter_usr:
				e_lump.textContent = '-----「' + uname + '」さんが入室しました -----';
				break;
			case IX_VcTYPE_exit_usr:
				e_lump.textContent = '-----「' + uname + '」さんが退室しました -----';
				break;
			case IX_VcTYPE_chgHst:
				e_lump.textContent = '-----「' + uname + '」さんに管理者権限が移りました -----';
				break;
			case IX_VcTYPE_chg_fmsg:
				e_lump.textContent = '----- 固定メッセージが変更されました -----';
				break;

			default: alert('エラー : Doj_Vc_SysMsg.Completion()');
		}
	}
	////////////////////////////////////////

	const udata = doj_RI.Get_udata(uID);
	if (udata === null) {
		m_bIsCmplt = false;
	} else {
//		const uname = udata[0];
		this.Completion(udata[0], null);
	}

	this.e_lump = e_lump;
	g_Room_Voices.AddVoice(this);
}
Doj_Vc_SysMsg.prototype.Resize = () => {};


////////////////////////////////////////////////////////////////

function Doj_Vc_umsg(doj_RI, uID, umsg) {
	const m_uID = uID;
	this.Get_uID = () => m_uID;

	let m_uname = null;  // Doj_Vc_umsg がクリックされたときに、名前が利用される
//	let m_uview = null;
	let m_bIsCmplt = null;
	this.IsComplete = () => m_bIsCmplt;

	let m_ix_SVL = null;
	this.Set_ix_SVL = (ix_SVL) => { m_ix_SVL = ix_SVL; };  // AddVoice() からコールされる

	const m_e_lump = document.createElement('div');
	m_e_lump.style.display = 'table';
	m_e_lump.style.width = '100%';
	this.e_lump = m_e_lump;

	const m_e_uview = document.createElement('div');
	m_e_uview.style.cssFloat = 'left';
	m_e_uview.style.margin = '0 0.5em 0.3em 0';
	m_e_uview.style.fontSize = '0.8em';
	m_e_uview.style.lineHeight = '0.8em';
	m_e_lump.appendChild(m_e_uview);

	const m_e_umsg = document.createElement('div');
	m_e_umsg.classList.add('vc_usr_txt');
	m_e_umsg.textContent = umsg;
	m_e_lump.appendChild(m_e_umsg);

	// -------------------------------------
	let m_e_icon_Rm = null;  // Resize() でアクセスする必要がある
	this.Completion = (uname, uview) => {
		m_uname = uname;

		m_e_icon_Rm = g_doj_char_pick.GetCln_e_icon_Rm(uview);
		m_e_uview.appendChild(m_e_icon_Rm);

		m_e_uview.appendChild(document.createElement('br'));
		m_e_uview.appendChild(document.createTextNode(uname));

		m_bIsCmplt = true;
	}

	// -------------------------------------
	// uview の生成
	// [uname, uview]
	const udata = doj_RI.Get_udata(uID);
	if (udata !== null) {
		this.Completion(udata[0], udata[1]);
//		m_bIsCmplt = true;
	} else {
		m_bIsCmplt = false;
	}
	// -------------------------------------
	
	g_Room_Voices.AddVoice(this);

	this.Resize = () => {
		const new_sz = Doj_Char_Pick.ms_iconSz_Rm;
		m_e_icon_Rm.width = new_sz;
		m_e_icon_Rm.height = new_sz;
	};
}


////////////////////////////////////////////////////////////////
const Room_Voices = function() {
	// ログの最大数
	let m_voice_max = c_MAX_Voices;  // m_voice_max はユーザーが変更可能にする
	let m_voice_curPcs;  // 現在表示されている voiceの個数

	// .Init() で設定される
//	let m_room_ID;  // サーバーにメッセージを送信する場合に必要となる
	let m_doj_room_info;
//	this.Get_doj_RI = () => m_doj_room_info;

	let m_doj_top_voice = null;  // insertBefore() でのみ利用
	// m_e_area_voices は Init() する際に、作成して append する
	let m_e_area_voices = null;

	// 通信エラーの検出用。
	// DN_umsg を受け取った際に、「m_ix_SVL_next == DN_umsg の ix_vc」となることが期待される
	let m_ix_SVL_next = null;

	// 現在表示中の vc を記録（Resize や Remove で利用）
	const ma_doj_vc_dspld = [];

	////////////////////////////////////////
	// メソッド

	// 戻り値が true の場合は、そのまま room の画面へ
	// 戻り値が false の場合は、DN_qry_udata の処理が終わってから room の画面へ
	const ma_doj_vc_to_uID = [];  // [[doj_vc1, doj_vc2, ...], ... ]

	// a_svl : [[[vc], [vc], ... [vc]], m_ix_vc]
	this.Init = (doj_RI, a_svl) => {
//		m_room_ID = doj_RI.Get_RoomID();
		m_doj_room_info = doj_RI;

		m_doj_top_voice = null;
		m_voice_curPcs = 0;
		m_ix_SVL_next = 0;  // AddVoice() のみでインクリメントされる
//		m_ix_SVL_next = a_svl[1] + 1;  // AddVoice() でインクリメントされるため、ここでは設定できない

		if (m_e_area_voices !== null) {
			g_doj_room.e_lump.removeChild(m_e_area_voices);
		}
		m_e_area_voices = document.createElement('div');
		g_doj_room.e_lump.appendChild(m_e_area_voices);

		// -------------------------------------
		// a_svl の処理を行う
		const a_incmplt_doj_Vc = [];

		// [uID, type, contents]
		for (let svl of a_svl[0]) {
			const uID = svl[0];
			const vc_type = svl[1];

			let ret_doj_vc = null;
			if (vc_type < IX_VcTYPE_umsg) {
				ret_doj_vc = new Doj_Vc_SysMsg(doj_RI, uID, vc_type);
			} else {
				// ▶ 現時点では、sys_msg でなければ、usr_msg となる
				ret_doj_vc = new Doj_Vc_umsg(doj_RI, uID, svl[2]);
			}

			if (ret_doj_vc.IsComplete() === false) {
				a_incmplt_doj_Vc.push(ret_doj_vc);
			}
		}

		// AddVoice() された回数と、ix_SVL は異なることがあるため、ここで再設定する
		m_ix_SVL_next = a_svl[1] + 1;
		if (a_incmplt_doj_Vc.length == 0) { return true; }

		// -------------------------------------
		// ここで、ret_doj_vc.IsComplete を解決すること
		const a_uID_toAsk = [];  // [id1, id2, ...]
//		a_doj_vc_to_uID = [];  // [[doj_vc1, doj_vc2, ...], ... ]

		for (let doj_vc of a_incmplt_doj_Vc) {
			const uID = doj_vc.Get_uID();
			const idx = a_uID_toAsk.indexOf(uID);

			if (idx < 0) {
				a_uID_toAsk.push(uID);
				ma_doj_vc_to_uID.push([doj_vc]);
			} else {
				ma_doj_vc_to_uID[idx].push(doj_vc);
			}
		}

g_DBG_F('UP_qry_udata');

		// uID 以外が不明であるユーザの情報を問い合わせる
		g_socketio.emit('UP_qry_udata', a_uID_toAsk);
		return false;
	};

	// [[uname1, uname2, ...], [uview1, uview2, ...]]
	this.Rslv_ma_doj_vc_to_uID = (udata) => {
		const a_uname = udata[0];
		const a_uview = udata[1];

		for (let idx = ma_doj_vc_to_uID.length - 1; idx >= 0; idx--) {
//			const uname = a_uname[idx];
			const uview = a_uview[idx];

			for (let doj_vc of ma_doj_vc_to_uID[idx]) {
//				doj_vc.Completion(uname, uview);
				doj_vc.Completion(a_uname[idx], uview);
			}
		}
		ma_doj_vc_to_uID.splice(0);

		g_doj_room.Open_AsGuest_Fnlz();
	};

	this.Purge = () => {
		if (m_e_area_voices !== null) {
			g_doj_room.e_lump.removeChild(m_e_area_voices);
		}
		m_e_area_voices = null;

		m_voice_curPcs = 0;
		m_ix_SVL_next = null;
	};

	this.Resize = () => {
		for (const doj_vc of ma_doj_vc_dspld) {
			doj_vc.Resize();
		}
	};

	// -----------------------------------------
	this.AddVoice = (doj_voice) => {
		ma_doj_vc_dspld.push(doj_voice);

		if (m_doj_top_voice === null) {
			m_e_area_voices.appendChild(doj_voice.e_lump);
		} else {
			m_e_area_voices.insertBefore(doj_voice.e_lump, m_doj_top_voice.e_lump);
		}
		m_doj_top_voice = doj_voice;

		doj_voice.Set_ix_SVL(m_ix_SVL_next);
		m_ix_SVL_next++;

		m_voice_curPcs++;
	};

	// -----------------------------------------
	this.Add_EntVc_uID = (uID) => {
		const udata = m_doj_room_info.Get_udata(uID);
		this.Add_EntVc_uname(udata[0]);
	};
	this.Add_EntVc_uname = (uname) => {
		const new_voice = new Doj_Smpl_Vc_SysMsg('-----「' + uname + '」さんが入室しました -----');
		this.AddVoice(new_voice);
	};

	this.Add_ChgHstVc_uID = (uID) => {
		const udata = m_doj_room_info.Get_udata(uID);
		this.Add_ChgHstVc_uname(udata[0]);
	};
	this.Add_ChgHstVc_uname = (uname) => {
		const new_voice = new Doj_Smpl_Vc_SysMsg('-----「' + uname + '」さんに管理者権限が移りました -----');
		this.AddVoice(new_voice);
	};

	this.Add_ExitVc_uID = (uID) => {
		const udata = m_doj_room_info.Get_udata(uID);
		this.Add_ExitVc_uname(udata[0]);
	};
	this.Add_ExitVc_uname = (uname) => {
		const new_voice = new Doj_Smpl_Vc_SysMsg('-----「' + uname + '」さんが退室しました -----');
		this.AddVoice(new_voice);
	};

	this.Add_Chg_fmsg = () => {
		const new_voice = new Doj_Smpl_Vc_SysMsg('----- 固定メッセージが変更されました -----');
		this.AddVoice(new_voice);
	};

	// -----------------------------------------
	// [uID, umsg, ix_vc]
	this.Set_OtherUsrUmsg = (ary) => {
		const uID = ary[0];
		const ix_vc_onSVL = ary[2];

		if (m_ix_SVL_next !== ix_vc_onSVL) {

g_DBG(JSON.stringify(ary));
g_DBG(m_ix_SVL_next);

			alert('Room_Voices.Set_OtherUsrUmsg() : 通信エラーが発生しました。エラーリカバリ未実装。');
			return;
		}

		// Doj_Vc_umsg は、new するだけで、自分で g_Room_Voices.AddVoice() をコールしてくれる
		new Doj_Vc_umsg(g_doj_room.Get_doj_RI(), uID, ary[1]);
	};
}

// [uID, umsg, ix_vc]
// ix_vc は、SVL における idx となる
g_socketio.on('DN_umsg', (ary) => { g_Room_Voices.Set_OtherUsrUmsg(ary); });

// [[uname1, uname2, ...], [uview1, uview2, ...]]
g_socketio.on('DN_qry_udata', (udata) => { g_Room_Voices.Rslv_ma_doj_vc_to_uID(udata); });
