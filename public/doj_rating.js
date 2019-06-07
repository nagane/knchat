'use strict';

const g_doj_rating = new function() {
	const m_e_raiting = document.createElement('div');
	m_e_raiting.classList.add('rating');
	m_e_raiting.textContent = '▼ 0';
	m_e_raiting.onclick = () => {
		if (g_doj_body_setting.IsVisible()) {
			g_doj_modal_scrn.Hide();
			g_doj_body_setting.Hide();
		} else {
			g_doj_modal_scrn.Show(m_e_raiting.onclick.bind(this));
			g_doj_body_setting.Show();
		}
	};

	this.e_lump = m_e_raiting;
};


const g_doj_body_setting = new function() {
	const m_fontSz_dflt
		= parseFloat(window.getComputedStyle(document.body, null).getPropertyValue('font-size'));
	this.Get_FontSz_dflt = () => m_fontSz_dflt;
	let m_fontSz_cur = m_fontSz_dflt;
	this.Get_FontSz_cur = () => m_fontSz_cur;

	// ---------------------------------
	const m_e_set_font_sz = document.createElement('div');
	m_e_set_font_sz.textContent = '文字の大きさ ';
	const m_e_slider_font_sz = document.createElement('input');
	m_e_slider_font_sz.type = 'range';
	m_e_slider_font_sz.min = 1;
	m_e_slider_font_sz.max = 6;
	m_e_slider_font_sz.value = 5;
	m_e_slider_font_sz.onchange = () => {
		m_fontSz_cur = m_fontSz_dflt * 0.9 ** (5 - m_e_slider_font_sz.value)
		document.body.style.fontSize = m_fontSz_cur + 'px';
		g_doj_char_pick.Resize(m_fontSz_cur);
	};
	m_e_set_font_sz.appendChild(m_e_slider_font_sz);

	// ---------------------------------
	const m_e_set_LH = document.createElement('div');
	m_e_set_LH.textContent = '１行の高さ　 ';
	const m_e_slider_LH = document.createElement('input');
	m_e_slider_LH.type = 'range';
	m_e_slider_LH.min = 1.2;
	m_e_slider_LH.max = 1.8;
	m_e_slider_LH.step = 0.1;
	m_e_slider_LH.value = 1.5;
	m_e_slider_LH.onchange = () => {
		document.body.style.lineHeight = m_e_slider_LH.value;
	};
	m_e_set_LH.appendChild(m_e_slider_LH);

	// ---------------------------------
	const m_e_btn_crt_room = document.createElement('button');
	m_e_btn_crt_room.classList.add('btn_e_d_effect');
	m_e_btn_crt_room.classList.add('btn_crt_room');
	m_e_btn_crt_room.textContent = '自分の部屋を作る';
	m_e_btn_crt_room.onclick = () => {
		g_doj_modal_scrn.Hide();
		g_doj_body_setting.Hide();

		g_doj_set_room_prof.Show();
	}

	// ---------------------------------
	const m_e_lump = document.createElement('div');
	m_e_lump.classList.add('body_setting');
	m_e_lump.appendChild(m_e_set_font_sz);
	m_e_lump.appendChild(m_e_set_LH);
	m_e_lump.appendChild(m_e_btn_crt_room);
	m_e_lump.hidden = true;

	this.e_lump = m_e_lump;

	/////////////////////////////////////////////////////////
	this.Show = () => {
		this.Adj_UI();
		m_e_lump.hidden = false;
	}
	this.Hide = () => m_e_lump.hidden = true;
	this.IsVisible = () => !m_e_lump.hidden;

	this.Adj_UI = () => {
		if (g_doj_crt_usr.Get_uID() < 0 || g_doj_room.IsOpen()) {
			m_e_btn_crt_room.disabled = true;
		} else {
			m_e_btn_crt_room.disabled = false;
		}
	};
};

