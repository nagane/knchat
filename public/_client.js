'use strict';

const ST_InitRI_NoRcv_connection = 0;
//const ST_InitRI_rcv_connection = ST_InitRI_NoRcv_connection + 1;
const ST_InitRI_emit_req_initRI = ST_InitRI_NoRcv_connection + 1;
const ST_InitRI_rcv_initRI = ST_InitRI_emit_req_initRI + 1;

// ブラウザの処理速度によって、サーバからの自動接続が速すぎるときがあることへの対処
let g_ST_init_RI = ST_InitRI_NoRcv_connection;

////////////////////////////////////////////////////////////////
// ポート番号を変更する場合
// 1) server.js、client.js の書き換え
// 2) GCP のファイアウォール、iptables の設定
// 3) 自宅ファイアウォールの設定（gate_study）

//const str_serverip = 'http://192.168.0.22:3000';
const str_serverip = 'http://34.83.171.58:49881';

// socket.io クライアント側の生成
const g_socketio = io(str_serverip);


// RoomInfo
// [topic_id, capa, str_room_prof, [uID], [uname], [uview], room_id]
const IX_RInfo_topic_id = 0;
const IX_RInfo_capa = 1;
const IX_RInfo_str_room_prof = 2;
const IX_RInfo_uID = 3;
const IX_RInfo_uname = 4;
const IX_RInfo_uview = 5;
const IX_RInfo_roomID = 6;

// サーバーと、同一の値になるように設定
// SVL
// [user_id, type, contents]
const IX_VcTYPE_enter_usr = 1;
const IX_VcTYPE_exit_usr = 2;
const IX_VcTYPE_chgHst = 3;
const IX_VcTYPE_chg_fmsg = 4;
const IX_VcTYPE_umsg = 10;


////////////////////////////////////////////////////////////////

const g_doj_body = new function() {
	const m_body = document.body;

	this.Append = (doj) => {
		m_body.appendChild(doj.e_lump);
	};
};

const g_stt = new function() {
	this.dsbl_gazou = false;
	let m_room_dsble_gazou = false;
	this.IsDsbl_Gazou = () => this.dsbl_gazou || m_room_dsble_gazou;
};


const g_doj_dbgcnsl = new function() {
	const m_e_lump = document.createElement('div');
	m_e_lump.style.fontSize = '0.6rem';

	const dbgcnsl_hr_top = document.createElement('hr');
	dbgcnsl_hr_top.classList.add('dbgcnsl_hr');
	m_e_lump.appendChild(dbgcnsl_hr_top);

	const m_e_btn_hide = document.createElement('button');
	m_e_btn_hide.style.fontSize = '0.6rem';
	m_e_btn_hide.style.marginRight = '1em';
	m_e_btn_hide.textContent = 'デバッグ出力を隠す';
	m_e_btn_hide.onclick = OnClkBtn_Hide.bind(this);
	m_e_lump.appendChild(m_e_btn_hide);

	const m_e_btn_clear = document.createElement('button');
	m_e_btn_clear.style.fontSize = '0.6rem';
//	m_e_btn_clear.style.marginRight = '1em';
	m_e_btn_clear.textContent = 'デバッグ出力クリア';
	m_e_btn_clear.onclick = CnslArea_Clear.bind(this);
	m_e_lump.appendChild(m_e_btn_clear);

	const m_e_fixd_area = document.createElement('div');
	const m_e_fixd_txt_1 = document.createTextNode('　→　');
	m_e_fixd_area.appendChild(m_e_fixd_txt_1);
	const m_e_fixd_txt_2 = document.createTextNode('　→　');
	m_e_fixd_area.appendChild(m_e_fixd_txt_2);
	const m_e_fixd_txt_3 = document.createTextNode('　→　');
	m_e_fixd_area.appendChild(m_e_fixd_txt_3);
	const m_e_fixd_txt_4 = document.createTextNode('');
	m_e_fixd_area.appendChild(m_e_fixd_txt_4);
	m_e_lump.appendChild(m_e_fixd_area);


	// 出力エリアは、クリアする際、破棄されて新規に作り直される
	let m_e_cnsl_area = document.createElement('div');
	m_e_lump.appendChild(m_e_cnsl_area);

	const dbgcnsl_hr_btm = document.createElement('hr');
	dbgcnsl_hr_btm.classList.add('dbgcnsl_hr');
	m_e_lump.appendChild(dbgcnsl_hr_btm);

	this.e_lump = m_e_lump;

	// -----------------------------------------
	function CnslArea_Clear() {
		m_e_lump.removeChild(m_e_cnsl_area);

		m_e_cnsl_area = document.createElement('div');
		m_e_cnsl_area.style.fontSize = '0.6rem';
		m_e_lump.insertBefore(m_e_cnsl_area, dbgcnsl_hr_btm);
	}

	let m_bShow = true;
	function OnClkBtn_Hide() {
		if (m_bShow) {
			m_e_fixd_area.hidden = true;
			m_e_cnsl_area.hidden = true;
			m_bShow = false;
		} else {
			m_e_fixd_area.hidden = false;
			m_e_cnsl_area.hidden = false;
			m_bShow = true;
		}
	}

	/////////////////////////////////////////////////
	this.TextOut = (msg) => {
		m_e_cnsl_area.appendChild(document.createTextNode(msg));
		m_e_cnsl_area.appendChild(document.createElement('br'));
	};

	this.TextOut_Fixed = (msg) => {
		m_e_fixd_txt_1.textContent = m_e_fixd_txt_2.textContent;
		m_e_fixd_txt_2.textContent = m_e_fixd_txt_3.textContent;
		m_e_fixd_txt_3.textContent = m_e_fixd_txt_4.textContent + '　→　';
		m_e_fixd_txt_4.textContent = msg; 
	};
};

var g_DBG = g_doj_dbgcnsl.TextOut;
var g_DBG_F = g_doj_dbgcnsl.TextOut_Fixed;

////////////////////////////////////////////////////////////////

const g_Wait_NodeSvr = new function() {
	let m_obj = null;
	let m_fn = null;

	this.Set = (obj, fn, str_DBG = null) => {
		if (m_fn !== null) {
			alert('エラー ; g_Wait_NodeSvr.Set()');
			return;
		}

		m_obj = obj;
		m_fn = fn;

		g_socketio.emit('UP_READY', str_DBG);
	};

	this.Resume = () => {
		const obj = m_obj;
		const fn = m_fn;
		m_fn = null;

		if (obj === null) {
			fn();
		} else {
			fn.bind(obj)();
		}
	};

	this.Reset = () => {
		m_obj == null;
		m_fn ==  null;
	};
}
// デバッグ用
//g_Wait_NodeSvr.toString = () => 'g_Wait_NodeSvr';

g_socketio.on('DN_READY', () => {
	g_Wait_NodeSvr.Resume()
});

////////////////////////////////////////////////////////////////

// メッセージディスパッチ用に、'\n' が改行コードとなった string が戻り値として返される
function TxtArea_toDiv(src_txtarea, dst_div) {
	const txt_n = src_txtarea.value.replace(/\r\n/g, '\n');
	NTxt_toDiv(txt_n, dst_div);
	return txt_n;
}

function NTxt_toDiv(txt_n, dst_div) {
	const a_line = txt_n.split('\n');

	let bfirst = true;
	for (const line of a_line) {
		if (bfirst) {
			dst_div.appendChild(document.createTextNode(line));
			bfirst = false;
		} else {
			dst_div.appendChild(document.createElement('br'));
			dst_div.appendChild(document.createTextNode(line));
		}
	}
}
