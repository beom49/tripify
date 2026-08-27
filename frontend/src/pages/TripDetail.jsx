import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, esc, won, dday } from '../api';
import { useAuthCtx } from '../App.jsx';

const TABS = [['info', '기본 정보'], ['schedule', '일정 관리'], ['map', '지도'], ['expense', '경비 관리']];

function InfoTab({ trip }) {
  return (
    <div className="two">
      <div>
        <article className="box">
          <h2>여행 요약</h2>
          <p className="muted" style={{ lineHeight: 1.8 }}>
            {esc(trip.intro) || '소개를 작성해보세요.'}
          </p>
        </article>
        <article className="box" style={{ marginTop: 30 }}>
          <h2>중요 메모</h2>
          <div className="note">
            <b style={{ color: 'var(--c)' }}>준비물 확인 ⚠</b><br />
            여권, 환전, 예약 확인서를 출발 전 꼭 챙기세요.
          </div>
        </article>
      </div>
      <aside className="box">
        <h2>준비물 체크리스트 📝</h2>
        <div className="check done">여권 및 현금 환전</div>
        <div className="check done">돼지코 어댑터</div>
        <div className="check done">포켓 와이파이 신청</div>
        <div className="check">여행자 보험 가입</div>
        <div className="check">얇은 겉옷 챙기기</div>
      </aside>
    </div>
  );
}

function ScheduleTab({ tripId }) {
  const [schedules, setSchedules] = useState(null);
  const [form, setForm] = useState({ day: 1, time: '', title: '', memo: '' });
  const [error, setError] = useState('');

  const load = () => api(`/api/trips/${tripId}/schedules`)
    .then(setSchedules)
    .catch(e => setError(e.message));

  useEffect(() => { load(); }, [tripId]);

  const days = {};
  schedules?.forEach(s => { (days[s.day] = days[s.day] || []).push(s); });

  return (
    <div className="box">
      <h2>일정 관리</h2>
      {!schedules && !error && <p className="muted">불러오는 중...</p>}
      {error && <p className="muted">{error}</p>}
      {schedules && schedules.length === 0 && <p className="muted">등록된 일정이 없습니다. 아래에서 추가해보세요!</p>}
      {Object.keys(days).sort((a, b) => a - b).map(day => (
        <div key={day}>
          <p style={{ fontWeight: 'bold', margin: '14px 0 6px' }}>DAY {day}</p>
          {days[day].map(s => (
            <div className="row" key={s.scheduleId}>
              <b>{esc(s.time)} {esc(s.title)}</b>
              <span className="muted">
                {esc(s.memo)}{' '}
                <a href="#!" style={{ color: '#ff5a3d' }} onClick={async e => {
                  e.preventDefault();
                  try {
                    await api(`/api/trips/${tripId}/schedules/${s.scheduleId}`, { method: 'DELETE' });
                    load();
                  } catch (err) { alert(err.message); }
                }}>✕</a>
              </span>
            </div>
          ))}
        </div>
      ))}
      <div className="box" style={{ marginTop: 20, background: '#faf8f6' }}>
        <b>+ 일정 추가</b>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
          <select value={form.day} onChange={e => setForm({ ...form, day: Number(e.target.value) })}>
            {[1, 2, 3, 4, 5].map(d => <option key={d} value={d}>DAY {d}</option>)}
          </select>
          <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          <input placeholder="일정 제목" style={{ flex: 1, minWidth: 160 }} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <input placeholder="메모 (선택)" style={{ flex: 1, minWidth: 160 }} value={form.memo} onChange={e => setForm({ ...form, memo: e.target.value })} />
          <button className="primary" onClick={async () => {
            if (!form.title) return alert('일정 제목을 입력해주세요.');
            try {
              await api(`/api/trips/${tripId}/schedules`, { method: 'POST', body: form });
              setForm({ day: 1, time: '', title: '', memo: '' });
              load();
            } catch (e) { alert(e.message); }
          }}>추가</button>
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = ['숙소', '교통', '식비', '관광·쇼핑'];

function ExpenseTab({ tripId }) {
  const [expenses, setExpenses] = useState(null);
  const [form, setForm] = useState({ category: '숙소', item: '', amount: '' });
  const [error, setError] = useState('');

  const load = () => api(`/api/trips/${tripId}/expenses`)
    .then(setExpenses)
    .catch(e => setError(e.message));

  useEffect(() => { load(); }, [tripId]);

  const totals = {};
  let sum = 0;
  expenses?.forEach(x => {
    totals[x.category] = (totals[x.category] || 0) + x.amount;
    sum += x.amount;
  });

  return (
    <div className="box">
      <h2>여행 경비</h2>
      {!expenses && !error && <p className="muted">불러오는 중...</p>}
      {error && <p className="muted">{error}</p>}
      {expenses && expenses.length === 0 && <p className="muted">등록된 경비가 없습니다. 아래에서 추가해보세요!</p>}
      {sum > 0 && CATEGORIES.filter(c => totals[c]).map(c => (
        <div className="row" key={c}>
          <span>{c} <small className="muted">({expenses.filter(i => i.category === c).length}건)</small></span>
          <b>{won(totals[c])}</b>
        </div>
      ))}
      {sum > 0 && <div className="total">총 지출 {won(sum)}</div>}
      <div className="box" style={{ marginTop: 20, background: '#faf8f6' }}>
        <b>+ 경비 추가</b>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input placeholder="항목 (예: 호텔 3박)" style={{ flex: 1, minWidth: 160 }} value={form.item} onChange={e => setForm({ ...form, item: e.target.value })} />
          <input type="number" min="0" placeholder="금액 (원)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <button className="primary" onClick={async () => {
            if (!form.item || !form.amount) return alert('항목과 금액을 입력해주세요.');
            try {
              await api(`/api/trips/${tripId}/expenses`, { method: 'POST', body: { ...form, amount: Number(form.amount) } });
              setForm({ ...form, item: '', amount: '' });
              load();
            } catch (e) { alert(e.message); }
          }}>추가</button>
        </div>
      </div>
    </div>
  );
}

export default function TripDetail() {
  const { user } = useAuthCtx();
  const navigate = useNavigate();
  const { tripId, tab = 'info' } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user === null) navigate('/login', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    api(`/api/trips/${tripId}`)
      .then(setTrip)
      .catch(e => setError(e.message));
  }, [user, tripId]);

  if (user === null) return null;
  if (error) {
    return <main className="container"><p className="muted">{error}</p></main>;
  }
  if (!trip) {
    return <main className="container"><p className="muted">불러오는 중...</p></main>;
  }

  return (
    <>
      <section className="head">
        <span className="chip">{esc(dday(trip.startDate))}</span>
        <h1>{esc(trip.title)}</h1>
        <p>▣ {esc(trip.startDate)} - {esc(trip.endDate)}　·　동행자 {trip.companions}명</p>
      </section>
      <div className="tabs">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? 'on' : ''}
            onClick={() => navigate(`/trip/${tripId}/${key}`)}
          >{label}</button>
        ))}
      </div>
      <main className="container">
        {tab === 'schedule' && <ScheduleTab tripId={tripId} />}
        {tab === 'expense' && <ExpenseTab tripId={tripId} />}
        {tab === 'map' && <div className="map">{esc(trip.destination || '').toUpperCase()}</div>}
        {tab === 'info' && <InfoTab trip={trip} />}
      </main>
    </>
  );
}
