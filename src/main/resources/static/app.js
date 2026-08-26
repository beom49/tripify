const app=document.querySelector('#app'),nav=(on='home')=>`<nav class="nav"><a class="brand" href="#home"><b>◎</b>Tripify<span style="color:#ff5a3d">.</span></a><div class="links"><a class="${on==='home'?'on':''}" href="#home">홈</a><a href="#explore">탐색</a><a class="${on==='trips'?'on':''}" href="#trips">내 여행</a><a href="#community">커뮤니티</a></div><div class="actions"><button class="soft" onclick="location.hash='create'">새 여행 만들기</button><i class="avatar">JK</i></div></nav>`,footer=()=>`<footer class="footer"><div class="foot"><div><a class="brand" href="#home"><b>◎</b>Tripify</a><p>Tripify와 함께 당신의 로망이 현실이 되는 특별한 여행을 계획해보세요. 맞춤형 루트 설계부터 동행 추천까지 한 번에.</p></div><p><b>서비스</b><br>여행지 탐색<br>일정 플래너<br>동행 찾기<br>트래블로그</p><p><b>고객지원</b><br>자주 묻는 질문<br>1:1 문의<br>이용약관<br>개인정보처리방침</p></div><small>© 2025 Tripify Inc. All rights reserved.</small></footer>`;
function home(){let places=['일본 교토','인도네시아 발리','이탈리아 아말피','프랑스 파리'];return nav()+`<section class="hero"><h1>어디로 떠나고 싶으신가요?</h1><p>꿈꿔왔던 모든 순간을 나만의 맞춤 루트로 안전하게 디자인해보세요.</p><div class="search"><div><small>여행지</small>📍 어디로 떠나시나요?</div><div><small>일정</small>🗓 날짜 선택</div><div><small>인원</small>♧ 인원 추가</div><button class="primary" onclick="location.hash='create'">⌕ 일정 짜기</button></div></section><main class="container"><span class="eyebrow">인기 여행지</span><h2 class="title">이번 달 가장 많이 검색된 명소</h2><div class="cards">${places.map((x,i)=>`<article class="place"><span class="chip">${['인기 급상승','휴양 & 웰니스','클래식 로망','미식 & 예술'][i]}</span><strong>${x}</strong><small>평균 경비 ₩${[280,420,650,820][i]},000~</small></article>`).join('')}</div><section style="margin-top:75px"><span class="eyebrow">추천 여행 코스</span><h2 class="title">전문가와 여행 마니아들이 설계한 루트</h2><div class="routegrid"><article class="route"><span class="eyebrow">29박 30일</span><h3>나홀로 떠나는 한 달 살기: 발리 예술과 서핑</h3><p class="muted">김민재 트래블러 · ♡ 1,240</p></article><article class="route"><span class="eyebrow">3박 4일</span><h3>건축학도와 함께 걷는 바르셀로나 가우디</h3><p class="muted">이소영 건축가 · ♡ 892</p></article></div></section></main>`+footer()}
function auth(sign=false){return `<main class="login"><section class="cover"><a class="brand" style="color:white" href="#home"><b style="color:white">◎</b>Tripify.</a><div class="tag"><h1>${sign?'새로운 여행의 시작':'기억에 남을<br>나만의 특별한 여정'}</h1><p>전 세계의 엄선된 여행지와 숙소를 탐색하고 계획해 보세요.</p></div><small>© 2025 Tripify Inc.</small></section><section class="form"><h1>${sign?'Tripify와 함께 떠나요!':'반가워요, 여행자님!'}</h1><p class="muted">${sign?'몇 가지 정보만 입력하면 바로 시작할 수 있어요.':'Tripify와 함께 다시 새로운 설렘을 시작해보세요.'}</p>${sign?'<label>이름</label><input placeholder="이름을 입력해주세요">':''}<label>이메일 주소</label><input placeholder="example@tripify.com"><label>비밀번호</label><input type="password" placeholder="••••••••"><button class="primary" onclick="location.hash='home'">${sign?'회원가입':'로그인'}</button><p class="center muted">${sign?'이미 계정이 있으신가요?':'아직 회원이 아니신가요?'} <a href="#${sign?'login':'signup'}" style="color:var(--c);font-weight:bold">${sign?'로그인하기':'회원가입하기'}</a></p><div class="social"><button>◉ Kakao</button><button>◉ Naver</button><button>◉ Google</button></div></section></main>`}
function trips(){let n=['우리 가족의 첫 번째 오사카 봄바람 가족여행 🌸','낭만 가득한 파리 미식 여행','발리에서의 한 달 살기'];return nav('trips')+`<section class="head"><span class="chip">MY TRIPS</span><h1>나의 여행, 가장 설레는 기록</h1><p>지나온 여행의 추억과 다가올 여정을 한눈에 관리하세요.</p></section><main class="container"><div style="display:flex;justify-content:space-between;align-items:center"><h2 class="title">다가오는 여행</h2><button class="primary" onclick="location.hash='create'">+ 새 여행 만들기</button></div><div class="trips">${n.map((x,i)=>`<article class="trip"><div class="photo"></div><div class="copy"><span class="eyebrow">D-${12+i*18}</span><h3>${x}</h3><p class="muted">2025.04.12 - 2025.04.16 · ${i+2}명</p><button class="soft" onclick="location.hash='detail'">여행 관리하기</button></div></article>`).join('')}</div></main>`+footer()}
function create(){return nav()+`<main class="container"><div class="form" style="width:min(780px,100%)"><span class="eyebrow">NEW TRIP</span><h1 class="title">새로운 여행을 만들어볼까요?</h1><div class="box"><label>여행 이름</label><input placeholder="예: 우리 가족의 첫 번째 오사카 여행"><label>여행지</label><input placeholder="어디로 떠나시나요?"><label>출발일</label><input type="date"><label>도착일</label><input type="date"><label>동행 인원</label><select><option>1명</option><option>2명</option><option>3명 이상</option></select><label>여행 소개</label><textarea placeholder="여행에 대한 간단한 소개를 적어주세요."></textarea><button class="primary" onclick="location.hash='detail'">여행 만들기</button></div></div></main>`+footer()}
function detail(tab='info'){let body=tab==='map'?'<div class="map">OSAKA · KYOTO · NARA</div>':tab==='expense'?`<div class="box"><h2>여행 경비</h2>${[['숙소','₩480,000'],['교통','₩182,000'],['식비','₩235,000'],['관광·쇼핑','₩120,000']].map(x=>`<div class="row"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}<div class="total">총 지출 ₩1,017,000</div></div>`:tab==='schedule'?`<div class="box"><h2>일정 관리</h2>${['DAY 1 · 간사이 공항 → 난바','DAY 2 · 오사카 성과 도톤보리','DAY 3 · 교토 당일치기','DAY 4 · 유니버설 스튜디오'].map((x,i)=>`<div class="row"><b>${x}</b><span class="muted">${i?'일정을 추가해보세요':'10:00 공항 도착 · 14:00 호텔 체크인'}</span></div>`).join('')}<button class="primary" style="margin-top:20px">+ 일정 추가</button></div>`:`<div class="two"><div><article class="box"><h2>여행 요약</h2><p class="muted" style="line-height:1.8">벚꽃이 흐드러지는 따뜻한 봄날, 온 가족이 함께 떠나는 첫 번째 오사카 여행입니다. 부모님의 편안한 이동을 위해 대중교통 동선을 최소화하고, 맛있는 미식 투어 위주로 일정을 설계했습니다.</p></article><article class="box" style="margin-top:30px"><h2>중요 메모</h2><div class="note"><b style="color:var(--c)">주교 코로초 예약 정보 ⚠</b><br>4월 13일 저녁 7시, 4명 예약 완료. 카드 결제 가능하지만 현금 지참 필수.</div><div class="note" style="background:#faf8f6">주요 패스 구매 정보<br><span class="muted">오사카 주유패스 2일권 실물 수령처를 확인하세요.</span></div></article></div><aside class="box"><h2>준비물 체크리스트 📝</h2><div class="check done">여권 및 엔화 현금 환전</div><div class="check done">돼지코 어댑터</div><div class="check done">포켓 와이파이 신청</div><div class="check">오사카 주유패스 바우처 출력</div><div class="check">봄 가디건 & 여분의 얇은 옷</div></aside></div>`;return nav('trips')+`<section class="head"><span class="chip">D-12</span><h1>우리 가족의 첫 번째 오사카 봄바람 가족여행 🌸</h1><p>▣ 2025.04.12 - 2025.04.16 (4박 5일)　·　동행자 3명 (가족 여행)</p></section><div class="tabs">${[['info','기본 정보'],['schedule','일정 관리'],['map','지도'],['expense','경비 관리']].map(x=>`<button class="${tab===x[0]?'on':''}" onclick="location.hash='detail/${x[0]}'">${x[1]}</button>`).join('')}</div><main class="container">${body}</main>`+footer()}
async function signup(){
  const inputs=document.querySelectorAll('.form input');
  const name=inputs[0]?.value.trim();
  const email=inputs[1]?.value.trim();
  const password=inputs[2]?.value;

  if(!name||!email||!password){
    alert('이름, 이메일, 비밀번호를 모두 입력해주세요.');
    return;
  }

  try{
    const response=await fetch('http://localhost:8080/users/signup',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name,email,password})
    });

    if(!response.ok){
      let message='회원가입에 실패했습니다. 다시 시도해주세요.';
      try{
        const error=await response.json();
        message=error.message||message;
      }catch(_){
        const errorText=await response.text();
        message=errorText||message;
      }
      throw new Error(message);
    }

    alert('회원가입이 완료되었습니다. 로그인해주세요.');
    location.hash='login';
  }catch(error){
    alert(error.message||'회원가입 중 오류가 발생했습니다.');
  }
}

document.addEventListener('click',event=>{
  if(location.hash==='#signup'&&event.target.matches('.form .primary')){
    event.preventDefault();
    event.stopImmediatePropagation();
    signup();
  }
},true);

function route(){let [p,t]=location.hash.slice(1).split('/');app.innerHTML=p==='login'?auth():p==='signup'?auth(1):p==='trips'?trips():p==='create'?create():p==='detail'?detail(t):home()}addEventListener('hashchange',route);route();
