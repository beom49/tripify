export default function Home() {
  const places = ['일본 교토', '인도네시아 발리', '이탈리아 아말피', '프랑스 파리'];
  const chips = ['인기 급상승', '휴양 & 웰니스', '클래식 로망', '미식 & 예술'];
  const costs = [280, 420, 650, 820];

  return (
    <>
      <section className="hero">
        <h1>어디로 떠나고 싶으신가요?</h1>
        <p>꿈꿔왔던 모든 순간을 나만의 맞춤 루트로 안전하게 디자인해보세요.</p>
        <div className="search">
          <div><small>여행지</small>📍 어디로 떠나시나요?</div>
          <div><small>일정</small>🗓 날짜 선택</div>
          <div><small>인원</small>♧ 인원 추가</div>
          <a className="primary" style={{ textDecoration: 'none' }} href="#/create">⌕ 일정 짜기</a>
        </div>
      </section>
      <main className="container">
        <span className="eyebrow">인기 여행지</span>
        <h2 className="title">이번 달 가장 많이 검색된 명소</h2>
        <div className="cards">
          {places.map((p, i) => (
            <article className="place" key={p}>
              <span className="chip">{chips[i]}</span>
              <strong>{p}</strong>
              <small>평균 경비 ₩{costs[i]},000~</small>
            </article>
          ))}
        </div>
        <section style={{ marginTop: 75 }}>
          <span className="eyebrow">추천 여행 코스</span>
          <h2 className="title">전문가와 여행 마니아들이 설계한 루트</h2>
          <div className="routegrid">
            <article className="route">
              <span className="eyebrow">29박 30일</span>
              <h3>나홀로 떠나는 한 달 살기: 발리 예술과 서핑</h3>
              <p className="muted">김민재 트래블러 · ♡ 1,240</p>
            </article>
            <article className="route">
              <span className="eyebrow">3박 4일</span>
              <h3>건축학도와 함께 걷는 바르셀로나 가우디</h3>
              <p className="muted">이소영 건축가 · ♡ 892</p>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
