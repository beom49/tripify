import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";
import { API_BASE } from "./api-config.js";

const app = document.querySelector('#app');

const fb = initializeApp(firebaseConfig);
const auth = getAuth(fb);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

let me = null;

async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const user = auth.currentUser;
  if (user) headers['Authorization'] = 'Bearer ' + await user.getIdToken();

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    let message = `요청 실패 (${res.status})`;
    try { message = (await res.json()).message || message; } catch (_) {}
    throw new Error(message);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function loadMe() {
  try { me = await api('/api/auth/me'); }
  catch (_) { me = null; }
}

async function handleFirebaseUser() {
  location.hash = 'home';
}

async function doSignup() {
  const inputs = document.querySelectorAll('.form input');
  const name = inputs[0]?.value.trim();
  const email = inputs[1]?.value.trim();
  const password = inputs[2]?.value;

  if (!name || !email || !password) return alert('이름, 이메일, 비밀번호를 모두 입력해주세요.');

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await handleFirebaseUser();
  } catch (error) {
    alert(firebaseErrorMessage(error));
  }
}

async function doLogin() {
  const inputs = document.querySelectorAll('.form input');
  const email = inputs[0]?.value.trim();
  const password = inputs[1]?.value;

  if (!email || !password) return alert('이메일과 비밀번호를 입력해주세요.');

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await handleFirebaseUser();
  } catch (error) {
    alert(firebaseErrorMessage(error));
  }
}

async function doGoogleLogin() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await handleFirebaseUser();
  } catch (error) {
    if (error.code !== 'auth/popup-closed-by-user') {
      alert(firebaseErrorMessage(error));
    }
  }
}

function firebaseErrorMessage(error) {
  const code = error?.code || '';
  if (code.includes('email-already-in-use')) return '이미 가입된 이메일입니다.';
  if (code.includes('invalid-email')) return '올바른 이메일 형식이 아닙니다.';
  if (code.includes('weak-password')) return '비밀번호는 6자 이상이어야 합니다.';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }
  if (code.includes('popup-blocked')) return '팝업이 차단되었습니다. 팝업을 허용해주세요.';
  if (code.includes('unauthorized-domain')) return '이 도메인은 Firebase에 등록되지 않았습니다. 콘솔에서 도메인을 추가해주세요.';
  return error?.message || '오류가 발생했습니다.';
}

async function doLogout() {
  if (!confirm('로그아웃하시겠습니까?')) return;
  try { await signOut(auth); } catch (_) {}
  me = null;
  location.hash = 'login';
}
window.doLogout = doLogout;

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const won = n => '₩' + Number(n || 0).toLocaleString('ko-KR');
const dday = dateStr => {
  if (!dateStr) return '';
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  return diff > 0 ? `D-${diff}` : diff === 0 ? 'D-DAY' : `D+${-diff}`;
};

const nav = (on = 'home') => `<nav class="nav"><a class="brand" href="#home"><b>◎</b>Tripify<span style="color:#ff5a3d">.</span></a><div class="links"><a class="${on === 'home' ? 'on' : ''}" href="#home">홈</a><a href="#explore">탐색</a><a class="${on === 'trips' ? 'on' : ''}" href="#trips">내 여행</a><a href="#community">커뮤니티</a></div><div class="actions"><button class="soft" onclick="location.hash='create'">새 여행 만들기</button><i class="avatar" title="${me ? esc(me.name) + ' · 로그아웃' : '로그인'}" onclick="${me ? "doLogout()" : "location.hash='login'"}">${me ? esc((me.name || '?')[0]) : '로그인'}</i></div></nav>`;
const footer = () => `<footer class="footer"><div class="foot"><div><a class="brand" href="#home"><b>◎</b>Tripify</a><p>Tripify와 함께 당신의 로망이 현실이 되는 특별한 여행을 계획해보세요. 맞춤형 루트 설계부터 동행 추천까지 한 번에.</p></div><p><b>서비스</b><br>여행지 탐색<br>일정 플래너<br>동행 찾기<br>트래블로그</p><p><b>고객지원</b><br>자주 묻는 질문<br>1:1 문의<br>이용약관<br>개인정보처리방침</p></div><small>© 2025 Tripify Inc. All rights reserved.</small></footer>`;

const requireLogin = () => { if (!auth.currentUser) { location.hash = 'login'; return true; } return false; };

function home() {
  let places = ['일본 교토', '인도네시아 발리', '이탈리아 아말피', '프랑스 파리'];
  return nav() + `<section class="hero"><h1>어디로 떠나고 싶으신가요?</h1><p>꿈꿔왔던 모든 순간을 나만의 맞춤 루트로 안전하게 디자인해보세요.</p><div class="search"><div><small>여행지</small>📍 어디로 떠나시나요?</div><div><small>일정</small>🗓 날짜 선택</div><div><small>인원</small>♧ 인원 추가</div><button class="primary" onclick="location.hash='create'">⌕ 일정 짜기</button></div></section><main class="container"><span class="eyebrow">인기 여행지</span><h2 class="title">이번 달 가장 많이 검색된 명소</h2><div class="cards">${places.map((x, i) => `<article class="place"><span class="chip">${['인기 급상승', '휴양 & 웰니스', '클래식 로망', '미식 & 예술'][i]}</span><strong>${x}</strong><small>평균 경비 ₩${[280, 420, 650, 820][i]},000~</small></article>`).join('')}</div><section style="margin-top:75px"><span class="eyebrow">추천 여행 코스</span><h2 class="title">전문가와 여행 마니아들이 설계한 루트</h2><div class="routegrid"><article class="route"><span class="eyebrow">29박 30일</span><h3>나홀로 떠나는 한 달 살기: 발리 예술과 서핑</h3><p class="muted">김민재 트래블러 · ♡ 1,240</p></article><article class="route"><span class="eyebrow">3박 4일</span><h3>건축학도와 함께 걷는 바르셀로나 가우디</h3><p class="muted">이소영 건축가 · ♡ 892</p></article></div></section></main>` + footer();
}

function authScreen(sign = false) {
  return `<main class="login"><section class="cover"><a class="brand" style="color:white" href="#home"><b style="color:white">◎</b>Tripify.</a><div class="tag"><h1>${sign ? '새로운 여행의 시작' : '기억에 남을<br>나만의 특별한 여정'}</h1><p>전 세계의 엄선된 여행지와 숙소를 탐색하고 계획해 보세요.</p></div><small>© 2025 Tripify Inc.</small></section><section class="form"><h1>${sign ? 'Tripify와 함께 떠나요!' : '반가워요, 여행자님!'}</h1><p class="muted">${sign ? '몇 가지 정보만 입력하면 바로 시작할 수 있어요.' : 'Tripify와 함께 다시 새로운 설렘을 시작해보세요.'}</p>${sign ? '<label>이름</label><input placeholder="이름을 입력해주세요">' : ''}<label>이메일 주소</label><input placeholder="example@tripify.com"><label>비밀번호</label><input type="password" placeholder="••••••••"><button class="primary" id="authSubmit">${sign ? '회원가입' : '로그인'}</button><p class="center muted">${sign ? '이미 계정이 있으신가요?' : '아직 회원이 아니신가요?'} <a href="#${sign ? 'login' : 'signup'}" style="color:var(--c);font-weight:bold">${sign ? '로그인하기' : '회원가입하기'}</a></p><div class="social"><button disabled>◉ Kakao</button><button disabled>◉ Naver</button><button id="googleBtn">◉ Google</button></div></section></main>`;
}

async function tripsScreen() {
  if (requireLogin()) return;
  app.innerHTML = nav('trips') + `<section class="head"><span class="chip">MY TRIPS</span><h1>나의 여행, 가장 설레는 기록</h1><p>지나온 여행의 추억과 다가올 여정을 한눈에 관리하세요.</p></section><main class="container"><div style="display:flex;justify-content:space-between;align-items:center"><h2 class="title">다가오는 여행</h2><button class="primary" onclick="location.hash='create'">+ 새 여행 만들기</button></div><div class="trips" id="tripList"><p class="muted">불러오는 중...</p></div></main>` + footer();

  try {
    const trips = await api('/api/trips');
    const list = document.querySelector('#tripList');
    list.innerHTML = trips.length ? trips.map(t => `<article class="trip"><div class="photo"></div><div class="copy"><span class="eyebrow">${esc(dday(t.startDate))}</span><h3>${esc(t.title)}</h3><p class="muted">${esc(t.startDate)} - ${esc(t.endDate)} · ${t.companions}명</p><button class="soft" onclick="location.hash='detail/${t.tripId}/info'">여행 관리하기</button> <button class="soft" style="margin-left:6px" onclick="deleteTrip('${t.tripId}')">삭제</button></div></article>`).join('') : '<p class="muted">아직 여행이 없습니다. 첫 여행을 만들어보세요!</p>';
  } catch (e) {
    document.querySelector('#tripList').innerHTML = `<p class="muted">${esc(e.message)}</p>`;
  }
}

async function createScreen() {
  if (requireLogin()) return;
  app.innerHTML = nav() + `<main class="container"><div class="form" style="width:min(780px,100%)"><span class="eyebrow">NEW TRIP</span><h1 class="title">새로운 여행을 만들어볼까요?</h1><div class="box"><label>여행 이름</label><input id="fTitle" placeholder="예: 우리 가족의 첫 번째 오사카 여행"><label>여행지</label><input id="fDest" placeholder="어디로 떠나시나요?"><label>출발일</label><input id="fStart" type="date"><label>도착일</label><input id="fEnd" type="date"><label>동행 인원</label><select id="fComp"><option value="1">1명</option><option value="2">2명</option><option value="3">3명 이상</option></select><label>여행 소개</label><textarea id="fIntro" placeholder="여행에 대한 간단한 소개를 적어주세요."></textarea><button class="primary" id="createBtn">여행 만들기</button></div></div></main>` + footer();

  document.querySelector('#createBtn').onclick = async () => {
    const title = document.querySelector('#fTitle').value.trim();
    const destination = document.querySelector('#fDest').value.trim();
    if (!title || !destination) return alert('여행 이름과 여행지를 입력해주세요.');
    try {
      await api('/api/trips', {
        method: 'POST',
        body: {
          title,
          destination,
          startDate: document.querySelector('#fStart').value,
          endDate: document.querySelector('#fEnd').value,
          companions: Number(document.querySelector('#fComp').value),
          intro: document.querySelector('#fIntro').value
        }
      });
      location.hash = 'trips';
    } catch (e) { alert(e.message); }
  };
}

async function detailScreen(tripId, tab = 'info') {
  if (requireLogin()) return;
  app.innerHTML = nav('trips') + `<section class="head" id="detailHead"><span class="chip">...</span><h1>불러오는 중...</h1></section><div class="tabs">${[['info', '기본 정보'], ['schedule', '일정 관리'], ['map', '지도'], ['expense', '경비 관리']].map(x => `<button class="${tab === x[0] ? 'on' : ''}" onclick="location.hash='detail/${tripId}/${x[0]}'">${x[1]}</button>`).join('')}</div><main class="container" id="detailBody"><p class="muted">불러오는 중...</p></main>` + footer();

  let trip;
  try { trip = await api(`/api/trips/${tripId}`); }
  catch (e) {
    document.querySelector('#detailHead').innerHTML = `<span class="chip">오류</span><h1>${esc(e.message)}</h1>`;
    return;
  }

  document.querySelector('#detailHead').innerHTML = `<span class="chip">${esc(dday(trip.startDate))}</span><h1>${esc(trip.title)}</h1><p>▣ ${esc(trip.startDate)} - ${esc(trip.endDate)}　·　동행자 ${trip.companions}명</p>`;

  if (tab === 'expense') renderExpenseTab(tripId);
  else if (tab === 'schedule') renderScheduleTab(tripId);
  else if (tab === 'map') {
    document.querySelector('#detailBody').innerHTML = `<div class="map">${esc(trip.destination || '').toUpperCase()}</div>`;
  } else {
    document.querySelector('#detailBody').innerHTML = `<div class="two"><div><article class="box"><h2>여행 요약</h2><p class="muted" style="line-height:1.8">${esc(trip.intro) || '<span class="muted">소개를 작성해보세요.</span>'}</p></article><article class="box" style="margin-top:30px"><h2>중요 메모</h2><div class="note"><b style="color:var(--c)">준비물 확인 ⚠</b><br>여권, 환전, 예약 확인서를 출발 전 꼭 챙기세요.</div></article></div><aside class="box"><h2>준비물 체크리스트 📝</h2><div class="check done">여권 및 현금 환전</div><div class="check done">돼지코 어댑터</div><div class="check done">포켓 와이파이 신청</div><div class="check">여행자 보험 가입</div><div class="check">얇은 겉옷 챙기기</div></aside></div>`;
  }
}

async function renderScheduleTab(tripId) {
  const body = document.querySelector('#detailBody');
  body.innerHTML = `<div class="box"><h2>일정 관리</h2><div id="scheduleList"><p class="muted">불러오는 중...</p></div><div class="box" style="margin-top:20px;background:#faf8f6"><b>+ 일정 추가</b><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px"><select id="sDay"><option value="1">DAY 1</option><option value="2">DAY 2</option><option value="3">DAY 3</option><option value="4">DAY 4</option><option value="5">DAY 5</option></select><input id="sTime" type="time" placeholder="시간"><input id="sTitle" placeholder="일정 제목" style="flex:1;min-width:160px"><input id="sMemo" placeholder="메모 (선택)" style="flex:1;min-width:160px"><button class="primary" id="addScheduleBtn">추가</button></div></div></div>`;

  const loadSchedules = async () => {
    const listEl = document.querySelector('#scheduleList');
    try {
      const schedules = await api(`/api/trips/${tripId}/schedules`);
      if (!schedules.length) { listEl.innerHTML = '<p class="muted">등록된 일정이 없습니다. 아래에서 추가해보세요!</p>'; return; }
      const days = {};
      schedules.forEach(s => { (days[s.day] = days[s.day] || []).push(s); });
      listEl.innerHTML = Object.keys(days).sort((a, b) => a - b).map(day => `
        <p style="font-weight:bold;margin:14px 0 6px">DAY ${day}</p>
        ${days[day].map(s => `<div class="row"><b>${esc(s.time)} ${esc(s.title)}</b><span class="muted">${esc(s.memo)} <a href="#" style="color:#ff5a3d" onclick="deleteSchedule('${tripId}','${s.scheduleId}');return false;">✕</a></span></div>`).join('')}
      `).join('');
    } catch (e) { listEl.innerHTML = `<p class="muted">${esc(e.message)}</p>`; }
  };
  window.deleteSchedule = async (tid, sid) => {
    try { await api(`/api/trips/${tid}/schedules/${sid}`, { method: 'DELETE' }); await loadSchedules(); }
    catch (e) { alert(e.message); }
  };

  document.querySelector('#addScheduleBtn').onclick = async () => {
    const day = Number(document.querySelector('#sDay').value);
    const time = document.querySelector('#sTime').value;
    const title = document.querySelector('#sTitle').value.trim();
    const memo = document.querySelector('#sMemo').value.trim();
    if (!title) return alert('일정 제목을 입력해주세요.');
    try {
      await api(`/api/trips/${tripId}/schedules`, { method: 'POST', body: { day, time, title, memo } });
      document.querySelector('#sTitle').value = ''; document.querySelector('#sMemo').value = ''; document.querySelector('#sTime').value = '';
      await loadSchedules();
    } catch (e) { alert(e.message); }
  };

  await loadSchedules();
}

async function renderExpenseTab(tripId) {
  const body = document.querySelector('#detailBody');
  const categories = ['숙소', '교통', '식비', '관광·쇼핑'];
  body.innerHTML = `<div class="box"><h2>여행 경비</h2><div id="expenseList"><p class="muted">불러오는 중...</p></div><div class="box" style="margin-top:20px;background:#faf8f6"><b>+ 경비 추가</b><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px"><select id="eCat">${categories.map(c => `<option>${c}</option>`).join('')}</select><input id="eItem" placeholder="항목 (예: 호텔 3박)" style="flex:1;min-width:160px"><input id="eAmount" type="number" min="0" placeholder="금액 (원)"><button class="primary" id="addExpenseBtn">추가</button></div></div></div>`;

  const fmtTotals = items => {
    const totals = {}; let sum = 0;
    items.forEach(x => { totals[x.category] = (totals[x.category] || 0) + x.amount; sum += x.amount; });
    return categories.filter(c => totals[c]).map(c => `<div class="row"><span>${c} <small class="muted">(${items.filter(i => i.category === c).length}건)</small></span><b>${won(totals[c])}</b></div>`).join('')
      + (sum ? `<div class="total">총 지출 ${won(sum)}</div>` : '');
  };

  const loadExpenses = async () => {
    const listEl = document.querySelector('#expenseList');
    try {
      const expenses = await api(`/api/trips/${tripId}/expenses`);
      listEl.innerHTML = expenses.length
        ? fmtTotals(expenses)
        : '<p class="muted">등록된 경비가 없습니다. 아래에서 추가해보세요!</p>';
    } catch (e) { listEl.innerHTML = `<p class="muted">${esc(e.message)}</p>`; }
  };
  window.deleteExpense = async (tid, eid) => {
    try { await api(`/api/trips/${tid}/expenses/${eid}`, { method: 'DELETE' }); await loadExpenses(); }
    catch (e) { alert(e.message); }
  };

  document.querySelector('#addExpenseBtn').onclick = async () => {
    const category = document.querySelector('#eCat').value;
    const item = document.querySelector('#eItem').value.trim();
    const amount = Number(document.querySelector('#eAmount').value);
    if (!item || !amount) return alert('항목과 금액을 입력해주세요.');
    try {
      await api(`/api/trips/${tripId}/expenses`, { method: 'POST', body: { category, item, amount } });
      document.querySelector('#eItem').value = ''; document.querySelector('#eAmount').value = '';
      await loadExpenses();
    } catch (e) { alert(e.message); }
  };

  await loadExpenses();
}

window.deleteTrip = async tripId => {
  if (!confirm('이 여행과 관련 일정·경비를 모두 삭제할까요?')) return;
  try { await api(`/api/trips/${tripId}`, { method: 'DELETE' }); route(); }
  catch (e) { alert(e.message); }
};

function wireAuthScreen(sign) {
  const submit = document.querySelector('#authSubmit');
  const google = document.querySelector('#googleBtn');
  if (submit) submit.onclick = sign ? doSignup : doLogin;
  if (google) google.onclick = doGoogleLogin;
}

async function route() {
  const [p, a, t] = location.hash.slice(1).split('/');
  if (p === 'login' || p === 'signup') { app.innerHTML = authScreen(p === 'signup'); wireAuthScreen(p === 'signup'); return; }
  if (auth.currentUser && me === null) await loadMe();
  if (p === 'trips') return tripsScreen();
  if (p === 'create') return createScreen();
  if (p === 'detail') return detailScreen(a, t);
  app.innerHTML = home();
}

addEventListener('hashchange', route);
route();
