export default function Community() {
  return (
    <>
      <section className="head">
        <span className="chip">COMMUNITY</span>
        <h1>커뮤니티</h1>
        <p>여행자들과 경험을 나누고, 함께 더 좋은 여행을 만들어보세요.</p>
      </section>
      <main className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🚧</div>
        <h2 style={{ fontSize: 28, marginBottom: 12 }}>준비 중입니다</h2>
        <p className="muted" style={{ fontSize: 16, lineHeight: 1.8 }}>
          여행 후기 공유, 동행 모집, 질문 & 답변 등<br />
          다양한 커뮤니티 기능을 곧 만나보실 수 있습니다.
        </p>
      </main>
    </>
  );
}
