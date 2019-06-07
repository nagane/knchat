'use strict';

const c_PASS_SU = 123456;
//const c_PASS_SU = 0;

// uview： 効果類？  色   id
//　　　　　7ff      fff  ff

const Doj_Char_Pick = function() {
	const c_img_scale = 2.5;
	Doj_Char_Pick.ms_iconSz_Rm = g_doj_body_setting.Get_FontSz_cur() * c_img_scale;
	Doj_Member.iconSz_Lby = g_doj_body_setting.Get_FontSz_cur() * Doj_Member.iconScale_Lby;

	let m_idx_focus = 0;
	this.Get_idx_focus = () => m_idx_focus;

	const m_e_lump = document.createElement('div');
	m_e_lump.classList.add('char_pick_tbl');
	this.e_lump = m_e_lump;


	const ma_img_fname = [['cherry', 'f40'], ['tulip', 'fe0'],
		['squirrel', 'c60'], ['dog', '6e0']];
	const m_img_pcs = ma_img_fname.length;

	const ma_e_img = new Array(m_img_pcs);
	const ma_e_img_tmp = new Array(m_img_pcs);
	const ma_color = new Array(m_img_pcs);

	for (let idx = 0; idx < m_img_pcs; idx++) {
		const e_img = new Image(Doj_Char_Pick.ms_iconSz_Rm, Doj_Char_Pick.ms_iconSz_Rm);
		e_img.src = './_images/' + ma_img_fname[idx][0] + '.png';
		ma_e_img_tmp[idx] = e_img.cloneNode(false);
		e_img.classList.add('char_img');
		e_img.style.backgroundColor = '#' + ma_img_fname[idx][1];
		ma_color[idx] = parseInt(ma_img_fname[idx][1], 16);

		e_img.onclick = () => {
			ma_e_img[m_idx_focus].classList.remove('char_img_focus');
			ma_e_img[idx].classList.add('char_img_focus');
			m_idx_focus = idx;
			g_doj_crt_usr.Set_uview(ma_color[m_idx_focus] * 256 + m_idx_focus);
		};

		ma_e_img[idx] = e_img;
		m_e_lump.appendChild(e_img);
	}
	ma_e_img[0].classList.add('char_img_focus');
	g_doj_crt_usr.Set_uview(ma_color[0] * 256 + 0);


	/////////////////////////////////////////////////////////
	this.Resize = (font_px) => {
		const new_sz = font_px * c_img_scale
		Doj_Char_Pick.ms_iconSz_Rm = new_sz;
		Doj_Member.iconSz_Lby = font_px * Doj_Member.iconScale_Lby;

		if (g_doj_room.IsOpen()) {
			g_Room_Voices.Resize();
		} else {
			g_view_Lobby.Resize();
		}

		// Room に対してアイコンを供給するため、随時サイズを追随させる
		for (let e_img of ma_e_img) {
			e_img.height = new_sz;
			e_img.width = new_sz;
		}
	};

	this.Show = () => {
		m_e_lump.style.display = 'table';
	};
	this.Hide = () => {
		m_e_lump.style.display = 'none';
	};

	// -------------------------------------
	this.GetCln_e_icon_Lby = (uview) => {
		const ix_icon = uview & 0xff;
		const e_ret = ma_e_img_tmp[ix_icon].cloneNode(false);
		e_ret.classList.add('icon_Lobby');
		
		e_ret.height = Doj_Member.iconSz_Lby;
		e_ret.width = Doj_Member.iconSz_Lby;

		const bg_color = (uview & 0xfff00) >>> 8;
		e_ret.style.backgroundColor = '#' + ('00' + bg_color.toString(16)).substr(-3);

		return e_ret;
	};

	// -------------------------------------
	this.GetCln_e_icon_Rm = (uview) => {
		const ix_icon = uview & 0xff;
		const e_ret = ma_e_img_tmp[ix_icon].cloneNode(false);
		e_ret.classList.add('icon_Room');

		e_ret.height = Doj_Char_Pick.ms_iconSz_Rm;
		e_ret.width = Doj_Char_Pick.ms_iconSz_Rm;

		const bg_color = (uview & 0xfff00) >>> 8;
		e_ret.style.backgroundColor = '#' + ('00' + bg_color.toString(16)).substr(-3);

		return e_ret;
	};
};
Doj_Char_Pick.ms_iconSz_Rm = null;


const Doj_CreateUser = function() {
	let m_uID = -1;  // 'DN_crtd_usr' にて、サーバーから割り当てられる
	this.Get_uID = () => m_uID;

	let m_uname = null;
	this.Get_uname = () => m_uname;

	let m_uview = 0;
	this.Get_uview = () => m_uview;
	this.Set_uview = (uview) => { m_uview = uview; };

	// -------------------------------------
	const m_e_lump = document.createElement('div');
	m_e_lump.classList.add('crt_usr');
	this.e_lump = m_e_lump;

	const m_e_btn_minz = document.createElement('button');
	m_e_btn_minz.classList.add('btn_crt_usr_minz');
	m_e_btn_minz.textContent = '最小化';
	m_e_btn_minz.onclick = OnClickBtn_minz.bind(this);
	m_e_lump.appendChild(m_e_btn_minz);

	const m_e_description = Create_e_str_div(a_str_crt_usr);
	m_e_description.classList.add('site_description');
	m_e_lump.appendChild(m_e_description);


	const m_e_btn = document.createElement('button');
	m_e_btn.classList.add('btn_e_d_effect');
	m_e_btn.textContent = '名前を決定';
	m_e_btn.onclick = CreateUser.bind(this);
	m_e_btn.disabled = true;
	m_e_btn.style.marginRight = '10px';
	m_e_lump.appendChild(m_e_btn);


	const m_e_input = document.createElement('input');
	m_e_input.classList.add('input_uname');
	m_e_input.placeholder = '名前を入力してください';
	m_e_input.onkeyup = OnKeyUp_uname.bind(this);
	m_e_lump.appendChild(m_e_input);


	// -------------------------------------
	function OnKeyUp_uname() {
		if (m_e_input.value.trim().length == 0) {
			m_e_btn.disabled = true;
		} else {
			m_e_btn.disabled = false;
		}
	}

	let b_minz = false;
	let m_doj_char_pick = null;
	function OnClickBtn_minz() {
		if (b_minz) {
			// 元に戻す処理
			m_e_description.hidden = false;
			m_e_btn.hidden = false;
			m_e_input.hidden = false;
			m_doj_char_pick.Show();
			m_e_btn_minz.textContent = '最小化';

			m_e_lump.style.left = '1em';
			b_minz = false;
		} else {
			// 最小化の処理
			m_e_description.hidden = true;
			m_e_btn.hidden = true;
			m_e_input.hidden = true;
			m_doj_char_pick.Hide();
			m_e_btn_minz.textContent = '元に戻す';

			m_e_lump.style.left = 'auto';
			b_minz = true;
		}
	}

	////////////////////////////////////////
	// メソッド
/*
	this.Enabled = () => {
		m_e_btn.disabled = false;
		m_e_input.disabled = false;
	};
	this.Disabled = () => {
		m_e_btn.disabled = true;
		m_e_input.disabled = true;
	};
*/
	this.Focused = () => m_e_input.focus();

	this.Show = () => {
		m_e_lump.hidden = false;
//		m_doj_char_pick.Show();  // focus表示をつけるように通知
	}
	this.Hide = () => {
		m_e_lump.hidden = true;
//		m_doj_char_pick.Hide();  // focus表示を外すように通知
	}

	this.Apnd_CharPick = (doj) => {
		m_doj_char_pick = doj;
		m_e_lump.appendChild(doj.e_lump)
	};

/*
	// document.createElement('img'); を返す
	// Lobby には、自分のアイコンは１つだけのはずだから、appendChild() して問題ない
	let m_e_icon_Lby = null;
	let m_charIdx_cur_Lby = -1;  // -1 は、このクラスで所持しているものがない、ということ
	this.Get_e_icon_Lby = () => {
		if (m_charIdx_cur_Lby === g_doj_char_pick.Get_idx_focus()) {
			return m_e_icon_Lby;
		}

		m_charIdx_cur_Lby = g_doj_char_pick.Get_idx_focus();
	};
*/
	// -------------------------------------
	function CreateUser() {
		m_uname = m_e_input.value.trim();
/*
		if (m_uname.length == 0) {
			alert('名前を入力してください');
			return;
		}
*/
		this.Hide();

g_DBG_F('UP_new_usr');

		g_socketio.emit('UP_new_usr', [c_PASS_SU, m_uname, m_uview]);
	}
	
	this.DN_Crtd_Usr = (new_uID) => {
		if (new_uID < 0) {
			alert('何らかの理由によりユーザ情報が作成できませんでした');
			this.Show();
			return;
		}

		m_uID = new_uID;
	
//		this.Disabled();
//		g_doj_set_room_prof.Enabled();
//		g_doj_set_room_capa.Enabled();
	
		g_doj_topic_bindr.Enabled();
	}
}
g_socketio.on('DN_crtd_usr', (new_uID) => g_doj_crt_usr.DN_Crtd_Usr(new_uID));

