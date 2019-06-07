'use strict';

////////////////////////////////////////////////////////////////
// id、socket、ユーザ画像関連 のデータを実装版を後で作成する
// ▶ uview のインプリメント
const Doj_Member = function(uID, uname, uview) {
	const m_uID = uID;
	this.Get_uID = () => m_uID;

	const m_uview = uview;

	const m_e_lump = document.createElement('div');
	m_e_lump.classList.add('member_inRoom');
	m_e_lump.style.display = 'table';
	this.e_lump = m_e_lump;

	const m_e_icon_Lby = g_doj_char_pick.GetCln_e_icon_Lby(m_uview);
	m_e_icon_Lby.style.cssFloat = 'left';
	m_e_lump.appendChild(m_e_icon_Lby);

	const m_e_uname = document.createElement('div');
	m_e_uname.style.cssFloat = 'left';
	m_e_uname.style.paddingTop = '4px';
	m_e_uname.textContent = uname;
	m_e_lump.appendChild(m_e_uname);

	////////////////////////////////////////
	
	this.ResizeIcon = () => {
		m_e_icon_Lby.width = Doj_Member.iconSz_Lby;
		m_e_icon_Lby.height = Doj_Member.iconSz_Lby;
	};
}
Doj_Member.iconScale_Lby = 1.3;
Doj_Member.iconSz_Lby = 0;

////////////////////////////////////////////////////////////////

// 部屋の情報を一度に作成するのは大変であるから、ユーザ情報以外をまず与えて構築する
// その後、ユーザ情報は AddMember で加えていくことにする
const Doj_RoomInfo = function(topic_id, num_capa, str_room_prof, room_id) {

	// 部屋の人数が０人となって、部屋を削除するときに親が分かる必要がある
	const m_topic_ID = topic_id;

	const m_room_ID = room_id;
	this.Get_RoomID = () => m_room_ID;

	// 以下の３つはセットで扱うもの
	const ma_uID = [];
	const ma_uname = [];
	const ma_uview = [];

	// [uname, uview]
	this.Get_udata = (uID) => {
		const uIX = ma_uID.indexOf(uID);
		if (uIX < 0) {
			return null;
		}
		return [ma_uname[uIX], ma_uview[uIX]];
	}

	// -------------------------------------
	let m_capa = num_capa;  // capa は後で変更もあることに留意
	// ma_doj_member が、部屋にいる人の状態を表す
	const ma_doj_member = [];

	const m_e_hr_top = document.createElement("hr");
	m_e_hr_top.classList.add('hr_room_prof');

	const m_e_btn_enter = document.createElement('button');
	m_e_btn_enter.classList.add('btn_e_d_effect');
	m_e_btn_enter.classList.add('btn_entr_room');
	m_e_btn_enter.textContent = '入室(' + m_capa + '人まで)';
	m_e_btn_enter.style.marginRight = '10px';
	m_e_btn_enter.onclick = EnterMe.bind(this);

	const m_e_span_prof = document.createElement('span');
	m_e_span_prof.textContent = str_room_prof;

	const m_e_room_prof = document.createElement('div');
	m_e_room_prof.appendChild(m_e_btn_enter);
	m_e_room_prof.appendChild(m_e_span_prof);


	const m_e_members = document.createElement('div');
	m_e_members.classList.add('room_members');

	const e_lump = document.createElement('div');
	e_lump.style.width = '100%';
	e_lump.appendChild(m_e_hr_top);
	e_lump.appendChild(m_e_room_prof);
	e_lump.appendChild(m_e_members);

	this.e_lump = e_lump;

	// ------------------------------------------
	// doj_RI の「入室ボタン」をクリック
	function EnterMe() {
/*
		if (room_id < 0) {
			alert('サンプルルームには入室できません。');
			return;
		}
*/
		// Wait 状態に移行
		g_view_Lobby.Hide();
		g_doj_room.Show();
		// ▶　リカバリ関数の実装が必要
		g_doj_room.Dsbl_Oprtn(null, 0);
//		g_doj_WaitScrn.Show();

g_DBG_F('UP_CanEnt_me');

		// タイミングで入室できないときもある
		g_socketio.emit('UP_CanEnt_me', [m_room_ID, g_doj_crt_usr.Get_uID()]);
		Doj_RoomInfo.ms_dojRI_prsdEnter = this;
	}

	////////////////////////////////////////
	// メソッド
	this.AddMember = (uID, uname, uview, doj_member) => {
		ma_doj_member.push(doj_member);
		m_e_members.appendChild(doj_member.e_lump);

		// 再入室者である場合は、以前の情報が残っているため、登録の必要がない
		if (ma_uID.indexOf(uID) < 0){
			ma_uID.push(uID);
			ma_uname.push(uname);
			ma_uview.push(uview);
		}

		this.Adj_UI();
	}

	// ------------------------------------------
//	this.Enabled = () => {
	this.Adj_UI = () => {
		if (g_doj_crt_usr.Get_uID() >= 0 && ma_doj_member.length < m_capa) {
			m_e_btn_enter.disabled = false;
		} else {
			m_e_btn_enter.disabled = true;
		}
	}	
	this.Disabled = () => {
		m_e_btn_enter.disabled = true;
	}

	// 現時点では、アイコンのリサイズを行うのみ
	this.Resize = () => {
		for (const doj_member of ma_doj_member) {
			doj_member.ResizeIcon();
		}
	};

	// ------------------------------------------
	//「サーバー側で削除された後」にコールされる
	this.RemoveUsr = (uID) => {
		// 部屋の人数が１人だった場合は、doj_RI を削除してそれで終わりとする
		if (ma_doj_member.length === 1) {
			ga_doj_topic[m_topic_ID].UnRegist_dojRI(this);  // topic から removeChilde() も実行される
			ga_mng_doj_RI.Remove_byRmID(m_room_ID);
			return;
		}

		// doj_member は削除するが、再入室時に voice を表示するために、ma_uID 等の削除は行わない
		for (let ix = ma_doj_member.length - 1; ix >= 0; ix--) {
			const doj_member = ma_doj_member[ix];
			if (doj_member.Get_uID() === uID) {
				m_e_members.removeChild(doj_member.e_lump);
				ma_doj_member.splice(ix, 1);
				break;
			}

			if (ix === 0) {
				alert('エラー : Doj_RoomInfo.RemoveUsr()');
				return;
			}
		}

		// 部屋にゲストとして入ったとき、ログvoice を表示する際、
		// なるべくサーバーへの問い合わせをなくすために、以下の情報は残しておく。
		// Doj_RoomInfo.Get_udata() で利用される。
/*
		ma_uID.splice(idx, 1);
		ma_uname.splice(idx, 1);
		ma_uview.splice(idx, 1);
*/
		this.Adj_UI();
	}

	// ------------------------------------------
	this.Get_HostID = () => ma_doj_member[0].Get_uID();

	// ------------------------------------------
	// ここは「自分以外の誰か」が退室したときに、コールされるということに留意
	this.Rcv_DN_rmvUsr = (rmID, uID) => {
		// rmvUsr する前の状態のホストuID を記録しておく
		const pre_hst_uID = ma_doj_member[0].Get_uID();

		// Lobby の状況表示の更新。RemoveUsr() は、removeChild も実行してくれる
		this.RemoveUsr(uID);

		// 削除されたのが、自分が所属する部屋であれば、「～さんが退室しました」を表示
		// さらに、ホストの交代があった場合、「管理者権限」の移動についても表示
		if (g_doj_room.IsOpen() && g_doj_room.Get_RmID() === rmID) {
			const rmv_uIX = ma_uID.indexOf(uID);
			g_Room_Voices.Add_ExitVc_uname(ma_uname[rmv_uIX]);

			// 退室した人が、元ホストであれば、管理者権限の移動を表示する
			if (uID === pre_hst_uID) {
				const new_hst_uID = this.Get_HostID();
				const new_hst_uIX = ma_uID.indexOf(new_hst_uID);
				g_Room_Voices.Add_ChgHstVc_uname(ma_uname[new_hst_uIX]);
			}
		}
	};
}
Doj_RoomInfo.ms_dojRI_prsdEnter = null;


// DN_rmvUsr : 自分以外の誰かが退室したとき受信する
// [roomID, uID]
g_socketio.on('DN_rmvUsr', (ary) => {
	const rmID = ary[0];
	const uID = ary[1];

	const doj_RI = ga_mng_doj_RI.Search_byRmID(rmID);
	doj_RI.Rcv_DN_rmvUsr(rmID, uID);
});

// DN_addUser : 自分以外の誰かが入室したときに受信する
// [RmID, uID, uname, uview]
g_socketio.on('DN_addUser', (ary) => {
	const rmID = ary[0];
	const uID = ary[1];
	const uname = ary[2];
	const uview = ary[3];

	// doj_RI の更新
	const doj_RI = ga_mng_doj_RI.Search_byRmID(rmID);
	const add_doj_member = new Doj_Member(uID, uname, uview);
	// AddMember() は doj の変更も行ってくれる
	doj_RI.AddMember(uID, uname, uview, add_doj_member);

	// 追加されたのが、自分が所属する部屋であれば、「～さんが入室しました」を表示
	if (g_doj_room.IsOpen() && g_doj_room.Get_RmID() == rmID) {
		// doj_room を表示する処理に移る
		g_Room_Voices.Add_EntVc_uname(uname);
	}
});

// UP_CanEnt_me に対する応答
// a_svl : [[[vc], [vc], ... [vc]], m_ix_vc]
g_socketio.on('DN_CanEnt_me', (a_svl) => {

	if (a_svl.length === 0) {
		g_doj_room.Enbl_Oprtn();
		g_doj_room.Hide();
		g_view_Lobby.Show();

		alert('人数制限により、入室できませんでした。');
		return;
	}

	// CanEnt_me の発信者のところには、DN_addUser が送信されないため、
	// doj_RI の更新を自分で行う
	const uID = g_doj_crt_usr.Get_uID();
	const uname = g_doj_crt_usr.Get_uname();
	const uview = g_doj_crt_usr.Get_uview();
	const doj_RI = Doj_RoomInfo.ms_dojRI_prsdEnter;
	const add_doj_member = new Doj_Member(uID, uname, uview);

	// AddMember() は doj の変更も行ってくれる
	doj_RI.AddMember(uID, uname, uview, add_doj_member);

	// a_svl には、「～さんが入室しました」のメッセージも含まれていることに留意
	g_doj_room.Open_AsGuest(doj_RI, a_svl);
});

// 他のユーザに作成された部屋を登録
g_socketio.on('DN_crtd_new_RI', (RI) => Doj_RoomInfo.prototype.Create_byRI(RI));

////////////////////////////////////////////////////////////////

// [topic_id, capa, str_room_prof, [uID], [uname], [uview], room_id]
Doj_RoomInfo.prototype.Create_byRI = function(ary) {
	const topic_id = ary[IX_RInfo_topic_id];

	const doj_room_info = new Doj_RoomInfo(
		topic_id,
		ary[IX_RInfo_capa],
		ary[IX_RInfo_str_room_prof],
		ary[IX_RInfo_roomID]
	);

	// メンバ登録
	const a_uID = ary[IX_RInfo_uID];
	const a_uname = ary[IX_RInfo_uname];
	const a_uview = ary[IX_RInfo_uview];
	const len = a_uID.length;
	
	for (let idx = 0; idx < len; idx++) {
		const uID = a_uID[idx];
		const uname = a_uname[idx];
		const uview = a_uview[idx];

		const doj_member = new Doj_Member(uID, uname, uview);
		// AddMember() において、Adj_UI() がコールされる
		doj_room_info.AddMember(uID, uname, uview, doj_member);
	}

	ga_doj_topic[topic_id].Regist(doj_room_info);

	return doj_room_info;
};


// [topic_id, capa, str_room_prof, [uname]]
Doj_RoomInfo.prototype.CreateSample = function(ary) {
	const topic_id = ary[0];
	const capa = ary[1];
	const str_room_prof = ary[2];
	const a_uname = ary[3];

	// room_id = -1 は、サンプルルームであることを表す
	const doj_room_info = new Doj_RoomInfo(topic_id, capa, str_room_prof, -1);

	// メンバ登録
	// CreateSample() がコールされる場合、a_roominfo[IX_RInfo_usr_infos] は、uname の配列となっている
	for (let uname of a_uname) {
		// uID = -1 はサンプルユーザであることを表す
		// uview = -1 は、サンプルuview を表す
		const uID = -1;
		const uview = -1;
		const doj_member = new Doj_Member(uID, uname, uview);
		doj_room_info.AddMember(uID, uname, uview, doj_member);
	}

	ga_doj_topic[topic_id].Regist(doj_room_info);
};
