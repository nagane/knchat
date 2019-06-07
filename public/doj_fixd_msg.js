'use strict';

const Doj_Fmsg = function() {
	let m_RmID = null;
	let m_uID;

	let m_bShow_main = false;

	const m_e_lump = document.createElement('div');
	m_e_lump.classList.add('fixed_msg_frm');
	this.e_lump = m_e_lump;
	m_e_lump.hidden = true;

	// -------------------------------------
	const m_e_zn_btn = document.createElement('div');
	m_e_zn_btn.style.marginBottom = '1em';
	m_e_lump.appendChild(m_e_zn_btn);

	const m_e_title = document.createElement('span');
	m_e_title.textContent = '部屋主からの固定メッセージ';
	m_e_title.style.padding ='0 0.5em';
	m_e_title.style.borderBottom = 'solid 2px #99f';
	m_e_zn_btn.appendChild(m_e_title);
	
	const m_e_btn_minz = document.createElement('button');
	m_e_btn_minz.classList.add('fixed_msg_btn');
	m_e_btn_minz.textContent = '最小化';
	m_e_btn_minz.onclick = OnClkBtn_minz.bind(this);
	m_e_zn_btn.appendChild(m_e_btn_minz);

	const m_e_btn_close = document.createElement('button');
	m_e_btn_close.classList.add('fixed_msg_btn');
	m_e_btn_close.textContent = '閉じる';
	m_e_zn_btn.appendChild(m_e_btn_close);

	const m_e_btn_mv = document.createElement('button');
	m_e_btn_mv.classList.add('fixed_msg_btn_mv');
	m_e_btn_mv.textContent = '上に移動';
	m_e_btn_mv.onclick = OnClkBtn_mv.bind(this);
	m_e_zn_btn.appendChild(m_e_btn_mv);

	const m_e_btn_edt = document.createElement('button');
	m_e_btn_edt.classList.add('fixed_msg_btn_mv');
	m_e_btn_edt.textContent = '編集';
	m_e_btn_edt.onclick = Show_frm_edt.bind(this);
	m_e_zn_btn.appendChild(m_e_btn_edt);

	// -------------------------------------
	const m_e_edt_frm = document.createElement('div');
	m_e_edt_frm.classList.add('fixed_msg_frm');
	m_e_edt_frm.style.fontSize = '1em';
	m_e_edt_frm.style.zIndex = 105;
	m_e_edt_frm.textContent = '固定メッセージの編集';
	m_e_lump.appendChild(m_e_edt_frm);
	m_e_edt_frm.hidden = true;

	const m_e_btn_edt_close = document.createElement('button');
	m_e_btn_edt_close.classList.add('fixed_msg_btn');
	m_e_btn_edt_close.textContent = '閉じる';
	m_e_btn_edt_close.onclick = () => { m_e_edt_frm.hidden = true; }
	m_e_edt_frm.appendChild(m_e_btn_edt_close);

	const m_e_btn_edt_OK = document.createElement('button');
	m_e_btn_edt_OK.classList.add('fixed_msg_btn');
	m_e_btn_edt_OK.textContent = '編集確定';
	m_e_btn_edt_OK.onclick = OnClkBtn_edt_OK.bind(this);
	m_e_edt_frm.appendChild(m_e_btn_edt_OK);

	const m_e_txtarea = document.createElement('textarea');
	m_e_txtarea.classList.add('fixed_msg_edt_txtarea');
	m_e_edt_frm.appendChild(m_e_txtarea);

	// -------------------------------------
	let m_e_fxd_msg = document.createElement('div');
	m_e_lump.appendChild(m_e_fxd_msg);


	// -------------------------------------
	let b_minz = false;
	function OnClkBtn_minz() {
		if (b_minz) {
			// 元に戻す処理
			m_e_title.hidden = false;
			if (g_doj_crt_usr.Get_uID() === g_doj_room.Get_HostID()) {
				m_e_btn_edt.hidden = false;
			} else {
				m_e_btn_edt.hidden = true;
			}
			m_e_btn_close.hidden = false;
			m_e_btn_mv.hidden = false;
			m_e_fxd_msg.hidden = false;
			m_e_btn_minz.textContent = '最小化';
			m_e_btn_minz.style.marginLeft = '1em';

			m_e_lump.style.left = '1em';
			b_minz = false;
		} else {
			// 最小化の処理
			m_e_title.hidden = true;
			m_e_btn_edt.hidden = true;
			m_e_btn_close.hidden = true;
			m_e_btn_mv.hidden = true;
			m_e_fxd_msg.hidden = true;
			m_e_btn_minz.textContent = '元に戻す';
			m_e_btn_minz.style.marginLeft = 0;

			m_e_lump.style.left = 'auto';
			b_minz = true;
		}
	}

	// 固定メッセージの変更
	function OnClkBtn_edt_OK() {
		m_e_lump.removeChild(m_e_fxd_msg);
		m_e_fxd_msg = document.createElement('div');
		m_e_lump.appendChild(m_e_fxd_msg);

		const fmsg_n = TxtArea_toDiv(m_e_txtarea, m_e_fxd_msg);
		m_e_edt_frm.hidden = true;

		g_Room_Voices.Add_Chg_fmsg();

g_DBG_F('UP_fmsg');

		g_socketio.emit('UP_fmsg', [m_RmID, m_uID, fmsg_n]);
	}

	let mb_pos_down = true;
	function OnClkBtn_mv() {
		if (mb_pos_down) {
			// 上に移動させる
			m_e_lump.style.top = '2em';
			m_e_lump.style.bottom = 'auto';
			m_e_btn_mv.textContent = '下に移動';
			mb_pos_down = false;
		} else {
			// 下に移動させる
			m_e_lump.style.top = 'auto';
			m_e_lump.style.bottom = '2em';
			m_e_btn_mv.textContent = '上に移動';
			mb_pos_down = true;
		}
	}

	function Show_frm_edt() {
		if (mb_pos_down) {
			m_e_edt_frm.style.top = 'auto';
			m_e_edt_frm.style.bottom = '2em';
		} else {
			m_e_edt_frm.style.top = '2em';
			m_e_edt_frm.style.bottom = 'auto';
		}
		m_e_edt_frm.hidden = false;
		m_e_txtarea.focus();
	}

	// -------------------------------------
	this.Init_AsHost = (rmID) => {
		m_RmID = rmID;
		m_uID = g_doj_crt_usr.Get_uID();

		m_e_txtarea.value = '';
		m_e_fxd_msg.value = '';
	};

	this.Init_AsGuest = (rmID) => {
		m_RmID = rmID;
		m_uID = g_doj_crt_usr.Get_uID();

//		m_e_txtarea.value = '';

g_DBG_F('UP_get_fmsg');

		g_socketio.emit('UP_get_fmsg', [m_RmID, m_uID]);	
	};

	this.Rcv_DN_fmsg = (fmsg_n) => {
		m_e_lump.removeChild(m_e_fxd_msg);
		m_e_fxd_msg = document.createElement('div');
		m_e_lump.appendChild(m_e_fxd_msg);

		NTxt_toDiv(fmsg_n, m_e_fxd_msg);
		g_Room_Voices.Add_Chg_fmsg();
	};

	this.Rcv_DN_get_fmsg = (fmsg_n) => {
		m_e_lump.removeChild(m_e_fxd_msg);
		m_e_fxd_msg = document.createElement('div');
		m_e_lump.appendChild(m_e_fxd_msg);

		NTxt_toDiv(fmsg_n, m_e_fxd_msg);
	};

	// -------------------------------------
	this.Toggle = () => {
		if (m_bShow_main) {
			this.Hide();
		} else {
			this.Show();
		}
	};
	this.Show = () => {
		if (g_doj_crt_usr.Get_uID() === g_doj_room.Get_HostID()) {
			m_e_btn_edt.hidden = false;
		} else {
			m_e_btn_edt.hidden = true;
		}
		m_e_lump.hidden = false;

		m_bShow_main = true;
	};
	this.Hide = () => {
		m_e_edt_frm.hidden = true;
		m_e_lump.hidden = true;

		m_bShow_main = false;
	};
	m_e_btn_close.onclick = this.Hide.bind(this);
};

g_socketio.on('DN_fmsg', (fmsg_n) => { g_doj_fixd_msg.Rcv_DN_fmsg(fmsg_n); });
g_socketio.on('DN_get_fmsg', (fmsg_n) => { g_doj_fixd_msg.Rcv_DN_get_fmsg(fmsg_n); });
