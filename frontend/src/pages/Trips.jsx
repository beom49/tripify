import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, esc, dday } from '../api';
import { useAuthCtx } from '../App.jsx';

export default function Trips() {
  const { user } = useAuthCtx();
  const navigate = useNavigate();
  const [trips, setTrips] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user === null) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    api('/api/trips')
      .then(setTrips)
      .catch(e => setError(e.message));
  }, [user]);

  const deleteTrip = async tripId => {
    if (!confirm('이 여행과 관련 일정·경비를 모두 삭제할까요?')) return;
    try {
      await api(`/api/trips/${tripId}`, { method: 'DELETE' });
      setTrips(trips.filter(t => t.tripId !== tripId));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <>
      <section className="head">
        <span className="chip">MY TRIPS</span>
        <h1>나의 여행, 가장 설레는 기록</h1>
        <p>지나온 여행의 추억과 다가올 여정을 한눈에 관리하세요.</p>
      </section>
      <main className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="title">다가오는 여행</h2>
          <Link to="/create" className="primary" style={{ textDecoration: 'none' }}>+ 새 여행 만들기</Link>
        </div>
        <div className="trips">
          {!trips && !error && <p className="muted">불러오는 중...</p>}
          {error && <p className="muted">{error}</p>}
          {trips && trips.length === 0 && <p className="muted">아직 여행이 없습니다. 첫 여행을 만들어보세요!</p>}
          {trips?.map(t => (
            <article className="trip" key={t.tripId}>
              <div className="photo"></div>
              <div className="copy">
                <span className="eyebrow">{esc(dday(t.startDate))}</span>
                <h3>{esc(t.title)}</h3>
                <p className="muted">{esc(t.startDate)} - {esc(t.endDate)} · {t.companions}명</p>
                <button className="soft" onClick={() => navigate(`/trip/${t.tripId}/info`)}>여행 관리하기</button>{' '}
                <button className="soft" style={{ marginLeft: 6 }} onClick={() => deleteTrip(t.tripId)}>삭제</button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
