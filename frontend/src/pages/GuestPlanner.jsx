import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthCtx } from '../App.jsx';
import { esc, won } from '../api';

const STORAGE_KEY = 'tripify_guest_plan';
const CATEGORIES = ['숙소', '교통', '식비', '관광·쇼핑', '기타'];
const TABS = [
  ['schedule', '📅 일정'],
  ['expense', '💰 경비'],
  ['checklist', '✅ 체크리스트'],
];
const DEFAULT_CHECKLIST = [
  { id: 1, text: '여권 / 비자 확인', done: false },
  { id: 2, text: '항공권 예약', done: false },
  { id: 3, text: '숙소 예약', done: false },
  { id: 4, text: '여행자 보험 가입', done: false },
  { id: 5, text: '환전 / 트래블카드', done: false },
  { id: 6, text: '포켓 와이파이 신청', done: false },
  { id: 7, text: '여행 일정 최종 확인', done: false },
];

function loadPlan() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePlan(plan) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

// DAY별 일정 탭
function ScheduleTab({ plan, setPlan }) {
  const [form, setForm] = useState({ day: 1, time: '', title: '', memo: '' });

  const days = {};
  plan.schedules.forEach(s => {
    (days[s.day] = days[s.day] || []).push(s);
  });

  const totalDays = plan.startDate && plan.endDate
    ? Math.max(1, Math.ceil((new Date(plan.endDate) - new Date(plan.startDate)) / 86400000) + 1)
    : 5;

  const addSchedule = () => {
    if (!form.title.trim()) return alert('일정 제목을 입력해주세요.');
    const updated = {
      ...plan,
      schedules: [...plan.schedules, { ...form, id: Date.now() }],
    };
    setPlan(updated);
    savePlan(updated);
    setForm({ ...form, title: '', memo: '', time: '' });
  };

  const deleteSchedule = id => {
    const updated = { ...plan, schedules: plan.schedules.filter(s => s.id !== id) };
    setPlan(updated);
    savePlan(updated);
  };

  return (
    <div className="planner-section">
      <div className="planner-days-header">
        {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
          <button
            key={d}
            className={`day-pill${form.day === d ? ' on' : ''}`}
            onClick={() => setForm({ ...form, day: d })}
          >
            DAY {d}
          </button>
        ))}
      </div>

      {Object.keys(days).length === 0 && (
        <p className="muted" style={{ padding: '20px 0' }}>아직 일정이 없어요. 아래에서 추가해보세요!</p>
      )}

      {Object.keys(days).sort((a, b) => a - b).map(day => (
        <div key={day} className="planner-day-block">
          <div className="planner-day-label">DAY {day}</div>
          {days[day]
            .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
            .map(s => (
              <div className="planner-schedule-row" key={s.id}>
                <div className="planner-schedule-time">{s.time || '--:--'}</div>
                <div className="planner-schedule-content">
                  <strong>{esc(s.title)}</strong>
                  {s.memo && <span className="muted"> · {esc(s.memo)}</span>}
                </div>
                <button
                  className="planner-del-btn"
                  onClick={() => deleteSchedule(s.id)}
                  title="삭제"
                >✕</button>
              </div>
            ))}
        </div>
      ))}

      <div className="planner-add-box">
        <div className="planner-add-title">+ 일정 추가 (DAY {form.day})</div>
        <div className="planner-add-row">
          <select
            className="planner-select"
            value={form.day}
            onChange={e => setForm({ ...form, day: Number(e.target.value) })}
          >
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>DAY {d}</option>
            ))}
          </select>
          <input
            type="time"
            className="planner-input"
            value={form.time}
            onChange={e => setForm({ ...form, time: e.target.value })}
          />
          <input
            className="planner-input"
            placeholder="일정 제목 (예: 아라시야마 대나무 숲)"
            style={{ flex: 2 }}
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && addSchedule()}
          />
          <input
            className="planner-input"
            placeholder="메모 (선택)"
            style={{ flex: 1.5 }}
            value={form.memo}
            onChange={e => setForm({ ...form, memo: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && addSchedule()}
          />
          <button className="primary" onClick={addSchedule}>추가</button>
        </div>
      </div>
    </div>
  );
}

// 경비 탭
function ExpenseTab({ plan, setPlan }) {
  const [form, setForm] = useState({ category: '숙소', item: '', amount: '' });

  const totals = {};
  let sum = 0;
  plan.expenses.forEach(x => {
    totals[x.category] = (totals[x.category] || 0) + x.amount;
    sum += x.amount;
  });

  const addExpense = () => {
    if (!form.item.trim() || !form.amount) return alert('항목과 금액을 입력해주세요.');
    const updated = {
      ...plan,
      expenses: [...plan.expenses, { ...form, amount: Number(form.amount), id: Date.now() }],
    };
    setPlan(updated);
    savePlan(updated);
    setForm({ ...form, item: '', amount: '' });
  };

  const deleteExpense = id => {
    const updated = { ...plan, expenses: plan.expenses.filter(e => e.id !== id) };
    setPlan(updated);
    savePlan(updated);
  };

  return (
    <div className="planner-section">
      {sum > 0 && (
        <div className="planner-expense-summary">
          {CATEGORIES.filter(c => totals[c]).map(c => (
            <div className="row" key={c}>
              <span>{c} <small className="muted">({plan.expenses.filter(i => i.category === c).length}건)</small></span>
              <b>{won(totals[c])}</b>
            </div>
          ))}
          <div className="total">총 예상 경비 {won(sum)}</div>
        </div>
      )}

      {plan.expenses.length === 0 && (
        <p className="muted" style={{ padding: '20px 0' }}>아직 경비가 없어요. 아래에서 추가해보세요!</p>
      )}

      {plan.expenses.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {plan.expenses.map(x => (
            <div className="planner-schedule-row" key={x.id}>
              <span className="chip" style={{ fontSize: 11, padding: '4px 10px' }}>{x.category}</span>
              <div className="planner-schedule-content">
                <strong>{esc(x.item)}</strong>
              </div>
              <b style={{ marginRight: 12 }}>{won(x.amount)}</b>
              <button className="planner-del-btn" onClick={() => deleteExpense(x.id)} title="삭제">✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="planner-add-box">
        <div className="planner-add-title">+ 경비 추가</div>
        <div className="planner-add-row">
          <select
            className="planner-select"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input
            className="planner-input"
            placeholder="항목 (예: 호텔 3박)"
            style={{ flex: 2 }}
            value={form.item}
            onChange={e => setForm({ ...form, item: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && addExpense()}
          />
          <input
            type="number"
            min="0"
            className="planner-input"
            placeholder="금액 (원)"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && addExpense()}
          />
          <button className="primary" onClick={addExpense}>추가</button>
        </div>
      </div>
    </div>
  );
}

// 체크리스트 탭
function ChecklistTab({ plan, setPlan }) {
  const [newItem, setNewItem] = useState('');

  const toggle = id => {
    const updated = {
      ...plan,
      checklist: plan.checklist.map(c => c.id === id ? { ...c, done: !c.done } : c),
    };
    setPlan(updated);
    savePlan(updated);
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const updated = {
      ...plan,
      checklist: [...plan.checklist, { id: Date.now(), text: newItem.trim(), done: false }],
    };
    setPlan(updated);
    savePlan(updated);
    setNewItem('');
  };

  const deleteItem = id => {
    const updated = { ...plan, checklist: plan.checklist.filter(c => c.id !== id) };
    setPlan(updated);
    savePlan(updated);
  };

  const done = plan.checklist.filter(c => c.done).length;
  const total = plan.checklist.length;

  return (
    <div className="planner-section">
      <div className="planner-progress-bar">
        <div className="planner-progress-track">
          <div
            className="planner-progress-fill"
            style={{ width: total ? `${(done / total) * 100}%` : '0%' }}
          />
        </div>
        <span className="muted" style={{ fontSize: 13 }}>{done} / {total} 완료</span>
      </div>

      <div style={{ marginBottom: 20 }}>
        {plan.checklist.map(c => (
          <div className="planner-check-row" key={c.id}>
            <label className={`check${c.done ? ' done' : ''}`} style={{ flex: 1, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={c.done}
                onChange={() => toggle(c.id)}
                style={{ display: 'none' }}
              />
              {esc(c.text)}
            </label>
            <button className="planner-del-btn" onClick={() => deleteItem(c.id)} title="삭제">✕</button>
          </div>
        ))}
      </div>

      <div className="planner-add-box">
        <div className="planner-add-row">
          <input
            className="planner-input"
            placeholder="체크리스트 항목 추가"
            style={{ flex: 1 }}
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
          />
          <button className="primary" onClick={addItem}>추가</button>
        </div>
      </div>
    </div>
  );
}

export default function GuestPlanner() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const [tab, setTab] = useState('schedule');
  const [saved, setSaved] = useState(false);

  const initPlan = () => {
    const stored = loadPlan();
    if (stored) return stored;
    return {
      destination: searchParams.get('destination') || '',
      startDate: searchParams.get('startDate') || '',
      endDate: searchParams.get('endDate') || '',
      companions: Number(searchParams.get('companions') || 2),
      schedules: [],
      expenses: [],
      checklist: DEFAULT_CHECKLIST,
    };
  };

  const [plan, setPlan] = useState(initPlan);

  // URL 파라미터로 들어왔을 때 plan 덮어쓰기 (처음 방문 시만)
  useEffect(() => {
    const dest = searchParams.get('destination');
    if (dest && !loadPlan()) {
      setPlan(prev => ({
        ...prev,
        destination: dest,
        startDate: searchParams.get('startDate') || prev.startDate,
        endDate: searchParams.get('endDate') || prev.endDate,
        companions: Number(searchParams.get('companions') || prev.companions),
      }));
    }
  }, []);

  const updateInfo = (field, value) => {
    const updated = { ...plan, [field]: value };
    setPlan(updated);
    savePlan(updated);
  };

  const handleSave = () => {
    if (!user) {
      if (confirm('여행 일정을 저장하려면 로그인이 필요해요.\n로그인 페이지로 이동할까요?')) {
        navigate('/login');
      }
      return;
    }
    savePlan(plan);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (!confirm('작성한 일정을 모두 초기화할까요?')) return;
    localStorage.removeItem(STORAGE_KEY);
    setPlan({
      destination: '',
      startDate: '',
      endDate: '',
      companions: 2,
      schedules: [],
      expenses: [],
      checklist: DEFAULT_CHECKLIST,
    });
  };

  const totalDays = plan.startDate && plan.endDate
    ? Math.max(1, Math.ceil((new Date(plan.endDate) - new Date(plan.startDate)) / 86400000) + 1)
    : null;

  return (
    <>
      {/* 플래너 헤더 */}
      <section className="planner-head">
        <div className="planner-head-inner">
          <div className="planner-head-meta">
            <Link to="/" className="planner-back">← 홈으로</Link>
            <span className="chip" style={{ background: '#fff3', color: '#fff' }}>✈️ 무료 플래너</span>
          </div>
          <h1 className="planner-head-title">
            {plan.destination || '여행지 미정'}
          </h1>
          <div className="planner-head-info">
            <div className="planner-info-field">
              <label>여행지</label>
              <input
                className="planner-hero-input"
                placeholder="예: 일본 교토"
                value={plan.destination}
                onChange={e => updateInfo('destination', e.target.value)}
              />
            </div>
            <div className="planner-info-field">
              <label>출발일</label>
              <input
                type="date"
                className="planner-hero-input"
                value={plan.startDate}
                onChange={e => updateInfo('startDate', e.target.value)}
              />
            </div>
            <div className="planner-info-field">
              <label>도착일</label>
              <input
                type="date"
                className="planner-hero-input"
                value={plan.endDate}
                onChange={e => updateInfo('endDate', e.target.value)}
              />
            </div>
            <div className="planner-info-field">
              <label>인원</label>
              <select
                className="planner-hero-input"
                value={plan.companions}
                onChange={e => updateInfo('companions', Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n}명</option>
                ))}
              </select>
            </div>
            <div className="planner-info-field">
              <label>기간</label>
              <div className="planner-hero-badge">
                {totalDays ? `${totalDays}박 ${totalDays}일` : '날짜를 선택하세요'}
              </div>
            </div>
          </div>
          <div className="planner-head-actions">
            <button className="planner-reset-btn" onClick={handleReset}>초기화</button>
            <button
              className={`planner-save-btn${saved ? ' saved' : ''}`}
              onClick={handleSave}
            >
              {saved ? '✓ 저장됨' : user ? '💾 저장하기' : '🔐 로그인 후 저장'}
            </button>
          </div>
        </div>
      </section>

      {/* 게스트 안내 배너 */}
      {!user && (
        <div className="planner-guest-banner">
          <span>📌 지금 작성 중인 일정은 브라우저에 임시 저장됩니다.</span>
          <Link to="/login" className="planner-banner-link">로그인하면 영구 저장 + 공유 가능 →</Link>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="tabs">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? 'on' : ''}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <main className="container" style={{ paddingTop: 40 }}>
        {tab === 'schedule' && <ScheduleTab plan={plan} setPlan={setPlan} />}
        {tab === 'expense' && <ExpenseTab plan={plan} setPlan={setPlan} />}
        {tab === 'checklist' && <ChecklistTab plan={plan} setPlan={setPlan} />}
      </main>
    </>
  );
}
