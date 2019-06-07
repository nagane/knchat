'use strict';

////////////////////////////////////////////////////////////////
/*
const c_Topic_NET_NONE = 100;
const c_Topic_WAIT_id_new_room = 101;
*/

const s_Doj_Topic = new function() {
//	this.net_status = c_Topic_NET_NONE;
	this.RI_underCrt = null;
};

////////////////////////////////////////////////////////////////

const Doj_Topic = function(str_topic) {
	const m_str_topic = str_topic;
	this.Get_StrTopic = () => m_str_topic;

	// topic の ID は順次設定される（topic_id はユーザ操作で変更されない）
	const m_topic_ID = g_nextID_doj_topic;
	g_nextID_doj_topic++;
	ga_doj_topic.push(this);

	// -------------------------------------
	const m_e_hr_top = document.createElement("hr");
	m_e_hr_top.classList.add('hr_topic');
/*
	const m_e_btn_create = document.createElement('button');
	m_e_btn_create.classList.add('btn_e_d_effect');
	m_e_btn_create.textContent = 'このブロックで部屋を作る';
	m_e_btn_create.style.marginRight = '10px';
*/
//	m_e_btn_create.onclick = CreateRoom.bind(this);

	const m_e_topic = document.createElement('div');
//	m_e_topic.appendChild(m_e_btn_create);
//	m_e_topic.appendChild(document.createTextNode(str_topic));
	m_e_topic.textContent = str_topic;

	const e_lump = document.createElement('div');
	e_lump.style.width = '100%';  // hr を両端に届かせるため
	e_lump.appendChild(m_e_hr_top);
	e_lump.appendChild(m_e_topic);
	this.e_lump = e_lump;

	// -------------------------------------
	const ma_doj_room_info = [];

	////////////////////////////////////////
	// メソッド
	this.Enabled = function() {
//		m_e_btn_create.disabled = false;
		for (let doj_room_info of ma_doj_room_info) {
			doj_room_info.Adj_UI();
		}
	};
	this.Disabled = function() {
//		m_e_btn_create.disabled = true;
		for (let doj_room_info of ma_doj_room_info) {
			doj_room_info.Disabled();
		}
	};

	this.Regist = function(doj_room_info) {
		ma_doj_room_info.push(doj_room_info);
		ga_mng_doj_RI.push(doj_room_info);

		this.e_lump.appendChild(doj_room_info.e_lump);
	};
	this.UnRegist_dojRI = (doj_RI) => {
		ma_doj_room_info.splice(ma_doj_room_info.indexOf(doj_RI), 1);
		this.e_lump.removeChild(doj_RI.e_lump);
	};
	this.UnRegist_all_dojRI = () => {
		for (let doj_RI of ma_doj_room_info) {
			this.e_lump.removeChild(doj_RI.e_lump);
		}
		ma_doj_room_info.splice(0);
	};

	this.Show = () => { this.e_lump.hidden = false; };
	this.Hide = () => { this.e_lump.hidden = true; };

	this.Resize = () => {
		for (let doj_RI of ma_doj_room_info) { doj_RI.Resize(); }
	};

	// -------------------------------------
	this.CreateRoom = () => {
		const str_room_prof = g_doj_set_room_prof.GetRoomProf().trim();
/*
		if (str_room_prof.length == 0) {
			alert('部屋のプロフィールを入力して下さい。');
			return;
		}
*/
/*
		if (s_Doj_Topic.net_status != c_Topic_NET_NONE) {
			// まだエラー処理を未実装
			alert('エラー : Doj_Topic.CreateRoom / ' + this.toString());
			return;
		}
*/
		// Wait 状態に移行
		g_view_Lobby.Hide();
		g_doj_fixd_msg.Hide();
		g_doj_room.Show();
		// ▶　リカバリ関数の実装が必要
		g_doj_room.Dsbl_Oprtn(null, 0);
//		g_doj_WaitScrn.Show();

		s_Doj_Topic.RI_underCrt = [
			m_topic_ID, g_doj_set_room_capa.GetCapa(), str_room_prof,
			[g_doj_crt_usr.Get_uID()]];

g_DBG_F('UP_new_Rm');

		g_socketio.emit('UP_new_Rm', s_Doj_Topic.RI_underCrt);
//		s_Doj_Topic.net_status = c_Topic_WAIT_id_new_room;
	};

	// -------------------------------------
	// デバッグ用
	this.toString = () => 'Doj_Topic -> ' + m_str_topic;
}

g_socketio.on('DN_new_RmID' , (new_room_id) => {
/*
	if (s_Doj_Topic.net_status !== c_Topic_WAIT_id_new_room) {
		// まだエラー処理を未実装
		alert('エラー : g_socketio.on -> DN_new_RmID');
		return;
	}
	s_Doj_Topic.net_status = c_Topic_NET_NONE;
*/
	// -------------------------------------
	// RI へ情報を付加し、完全な形式にする
	const RI = s_Doj_Topic.RI_underCrt;
	RI.push([g_doj_crt_usr.Get_uname()]);
	RI.push([g_doj_crt_usr.Get_uview()]);
	RI.push(new_room_id);
	// Create_byRI() は、doj_RI の生成と、g_doj_topic への Regist を行う
	// g_doj_topic への Regist は別操作にした方が良かったと思う、、、
	const new_doj_room_info = Doj_RoomInfo.prototype.Create_byRI(RI);

	g_doj_fixd_msg.Init_AsHost(new_room_id);
	g_doj_room.Open_AsHost(new_doj_room_info);
});


////////////////////////////////////////////////////////////////
// 将来、トピックをさらにまとめることを想定している
// 現時点では、トピックバインダは１つ
// トピック -> 県名
// トピックバインダ -> 地方ごと、など
const Doj_TopicBindr = function() {
	const ma_doj_topic = [];

	this.e_lump = document.createElement('div');
	this.e_lump.style.width = '100%';

	////////////////////////////////////////
	// メソッド
	this.Regist = (doj_topic) => {
		ma_doj_topic.push(doj_topic);		
		this.e_lump.appendChild(doj_topic.e_lump);
	};
	this.UnRegist_all_doj_RI = () => {
		for (let doj_topic of ma_doj_topic) {
			doj_topic.UnRegist_all_dojRI();
		}
//		ma_doj_topic.splice(0);
	}

	this.Enabled = () => { for (let doj_topic of ma_doj_topic) { doj_topic.Enabled(); } };
	this.Disabled = () => { for (let doj_topic of ma_doj_topic) { doj_topic.Disabled(); } };

	this.Show = () => { for (let doj_topic of ma_doj_topic) { doj_topic.Show(); } };
	this.Hide = () => { for (let doj_topic of ma_doj_topic) { doj_topic.Hide(); } };
}

