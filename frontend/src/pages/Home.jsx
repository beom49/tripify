import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [companions, setCompanions] = useState('2');

  const places = [
    { name: '일본 교토', chip: '인기 급상승', cost: 280 },
    { name: '인도네시아 발리', chip: '휴양 & 웰니스', cost: 420 },
    { name: '이탈리아 아말피', chip: '클래식 로망', cost: 650 },
    { name: '프랑스 파리', chip: '미식 & 예술', cost: 820 },
  ];

  const goPlanner = (dest = destination) => {
    const params = new URLSearchParams();
    if (dest) params.set('destination', dest);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (companions) params.set('companions', companions);
    navigate(`/planner?${params.toString()}`);
  };

  return (
    <>
      <section className="hero">
        <h1>어디로 떠나고 싶으신가요?</h1>
        <p>꿈꿔왔던 모든 순간을 나만의 맞춤 루트로 안전하게 디자인해보세요.</p>
        <div className="search">
          <div className="search-field">
            <small>여행지</small>
            <input
              className="search-input"
              placeholder="📍 어디로 떠나시나요?"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && goPlanner()}
            />
          </div>
          <div className="search-field">
            <small>출발일</small>
            <input
              className="search-input"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="search-field">
            <small>도착일</small>
            <input
              className="search-input"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          <div className="search-field" style={{ borderRight: 0 }}>
            <small>인원</small>
            <select
              className="search-input"
              value={companions}
              onChange={e => setCompanions(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n}명</option>
              ))}
            </select>
          </div>
          <button className="primary search-btn" onClick={() => goPlanner()}>
            ⌕ 일정 짜기
          </button>
        </div>
        <p className="hero-hint">로그인 없이도 바로 일정을 짤 수 있어요 ✈️</p>
      </section>
      <main className="container">
        <span className="eyebrow">인기 여행지</span>
        <h2 className="title">이번 달 가장 많이 검색된 명소</h2>
        <div className="cards">
          {places.map(({ name, chip, cost }) => (
            <article
              className="place"
              key={name}
              onClick={() => goPlanner(name)}
              style={{ cursor: 'pointer' }}
              title={`${name} 일정 바로 짜기`}
            >
              <span className="chip">{chip}</span>
              <strong>{name}</strong>
              <small>평균 경비 ₩{cost},000~</small>
              <span className="place-cta">일정 짜기 →</span>
            </article>
          ))}
        </div>
        <section style={{ marginTop: 75 }}>
          <span className="eyebrow">추천 여행 코스</span>
          <h2 className="title">전문가와 여행 마니아들이 설계한 루트</h2>
          <div className="routegrid">
            <article className="route" onClick={() => goPlanner('인도네시아 발리')} style={{ cursor: 'pointer' }}>
              <span className="eyebrow">29박 30일</span>
              <h3>나홀로 떠나는 한 달 살기: 발리 예술과 서핑</h3>
              <p className="muted">김민재 트래블러 · ♡ 1,240</p>
              <span className="route-cta">이 코스로 일정 짜기 →</span>
            </article>
            <article className="route" onClick={() => goPlanner('스페인 바르셀로나')} style={{ cursor: 'pointer' }}>
              <span className="eyebrow">3박 4일</span>
              <h3>건축학도와 함께 걷는 바르셀로나 가우디</h3>
              <p className="muted">이소영 건축가 · ♡ 892</p>
              <span className="route-cta">이 코스로 일정 짜기 →</span>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
