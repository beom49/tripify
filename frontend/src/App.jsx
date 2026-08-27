import { createContext, useContext, useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { api } from './api';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Trips from './pages/Trips.jsx';
import CreateTrip from './pages/CreateTrip.jsx';
import TripDetail from './pages/TripDetail.jsx';
import GuestPlanner from './pages/GuestPlanner.jsx';
import Community from './pages/Community.jsx';

const AuthContext = createContext({ user: null, me: null });
export const useAuthCtx = () => useContext(AuthContext);

function Nav({ on }) {
  const { me, user } = useAuthCtx();
  const navigate = useNavigate();

  return (
    <nav className="nav">
      <Link className="brand" to="/"><b>◎</b>Tripify<span style={{ color: '#ff5a3d' }}>.</span></Link>
      <div className="links">
        <Link className={on === 'home' ? 'on' : ''} to="/">홈</Link>
        <a href="#/explore">탐색</a>
        <Link className={on === 'trips' ? 'on' : ''} to="/trips">내 여행</Link>
        <Link className={on === 'community' ? 'on' : ''} to="/community">커뮤니티</Link>
      </div>
      <div className="actions">
        <button className="soft" onClick={() => navigate('/create')}>새 여행 만들기</button>
        <i
          className="avatar"
          title={user ? `${me?.name || user.email} · 로그아웃` : '로그인'}
          style={{ cursor: 'pointer', fontStyle: 'normal' }}
          onClick={() => (user ? confirm('로그아웃하시겠습니까?') && signOut(auth) : navigate('/login'))}
        >
          {user ? (me?.name || '?')[0] : '로그인'}
        </i>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="foot">
        <div>
          <a className="brand" href="#/"><b>◎</b>Tripify</a>
          <p>Tripify와 함께 당신의 로망이 현실이 되는 특별한 여행을 계획해보세요. 맞춤형 루트 설계부터 동행 추천까지 한 번에.</p>
        </div>
        <p><b>서비스</b><br />여행지 탐색<br />일정 플래너<br />동행 찾기<br />트래블로그</p>
        <p><b>고객지원</b><br />자주 묻는 질문<br />1:1 문의<br />이용약관<br />개인정보처리방침</p>
      </div>
      <small>© 2025 Tripify Inc. All rights reserved.</small>
    </footer>
  );
}

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = 로딩 중
  const [me, setMe] = useState(null);

  useEffect(() => onAuthStateChanged(auth, async u => {
    setUser(u);
    if (u) {
      try { setMe(await api('/api/auth/me')); } catch (_) { setMe(null); }
    } else {
      setMe(null);
    }
  }), []);

  if (user === undefined) return null;

  return (
    <AuthContext.Provider value={{ user, me }}>
      <Routes>
        <Route path="/" element={<><Nav on="home" /><Home /><Footer /></>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/planner" element={<><Nav /><GuestPlanner /><Footer /></>} />
        <Route path="/trips" element={<><Nav on="trips" /><Trips /><Footer /></>} />
        <Route path="/create" element={<><Nav /><CreateTrip /><Footer /></>} />
        <Route path="/trip/:tripId/:tab?" element={<><Nav on="trips" /><TripDetail /><Footer /></>} />
        <Route path="/community" element={<><Nav on="community" /><Community /><Footer /></>} />
      </Routes>
    </AuthContext.Provider>
  );
}
