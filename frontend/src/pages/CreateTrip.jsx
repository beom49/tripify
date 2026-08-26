import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuthCtx } from '../App.jsx';

export default function CreateTrip() {
  const { user } = useAuthCtx();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', destination: '', startDate: '', endDate: '', companions: 1, intro: ''
  });

  useEffect(() => {
    if (user === null) navigate('/login');
  }, [user, navigate]);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <main className="container">
      <div className="form" style={{ width: 'min(780px,100%)' }}>
        <span className="eyebrow">NEW TRIP</span>
        <h1 className="title">새로운 여행을 만들어볼까요?</h1>
        <div className="box">
          <label>여행 이름</label>
          <input placeholder="예: 우리 가족의 첫 번째 오사카 여행" value={form.title} onChange={set('title')} />
          <label>여행지</label>
          <input placeholder="어디로 떠나시나요?" value={form.destination} onChange={set('destination')} />
          <label>출발일</label>
          <input type="date" value={form.startDate} onChange={set('startDate')} />
          <label>도착일</label>
          <input type="date" value={form.endDate} onChange={set('endDate')} />
          <label>동행 인원</label>
          <select value={form.companions} onChange={e => setForm({ ...form, companions: Number(e.target.value) })}>
            <option value="1">1명</option>
            <option value="2">2명</option>
            <option value="3">3명 이상</option>
          </select>
          <label>여행 소개</label>
          <textarea placeholder="여행에 대한 간단한 소개를 적어주세요." value={form.intro} onChange={set('intro')} />
          <button className="primary" onClick={async () => {
            if (!form.title || !form.destination) return alert('여행 이름과 여행지를 입력해주세요.');
            try {
              await api('/api/trips', { method: 'POST', body: form });
              navigate('/trips');
            } catch (e) {
              alert(e.message);
            }
          }}>여행 만들기</button>
        </div>
      </div>
    </main>
  );
}
