import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { firebaseErrorMessage } from '../api';

export function AuthLayout({ sign, children }) {
  return (
    <main className="login">
      <section className="cover">
        <Link className="brand" style={{ color: 'white' }} to="/"><b style={{ color: 'white' }}>◎</b>Tripify.</Link>
        <div className="tag">
          <h1>{sign ? '새로운 여행의 시작' : <>기억에 남을<br />나만의 특별한 여정</>}</h1>
          <p>전 세계의 엄선된 여행지와 숙소를 탐색하고 계획해 보세요.</p>
        </div>
        <small>© 2025 Tripify Inc.</small>
      </section>
      <section className="form">{children}</section>
    </main>
  );
}

function SocialButtons() {
  const navigate = useNavigate();
  return (
    <div className="social">
      <button disabled>◉ Kakao</button>
      <button disabled>◉ Naver</button>
      <button onClick={async () => {
        try {
          await signInWithPopup(auth, googleProvider);
          navigate('/');
        } catch (error) {
          if (error.code !== 'auth/popup-closed-by-user') alert(firebaseErrorMessage(error));
        }
      }}>◉ Google</button>
    </div>
  );
}

export function AuthSwitch({ sign }) {
  return (
    <p className="center muted">
      {sign ? '이미 계정이 있으신가요?' : '아직 회원이 아니신가요?'}{' '}
      <Link to={sign ? '/login' : '/signup'} style={{ color: 'var(--c)', fontWeight: 'bold' }}>
        {sign ? '로그인하기' : '회원가입하기'}
      </Link>
    </p>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthLayout sign={false}>
      <h1>반가워요, 여행자님!</h1>
      <p className="muted">Tripify와 함께 다시 새로운 설렘을 시작해보세요.</p>
      <label>이메일 주소</label>
      <input placeholder="example@tripify.com" value={email} onChange={e => setEmail(e.target.value)} />
      <label>비밀번호</label>
      <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="primary" onClick={async () => {
        if (!email || !password) return alert('이메일과 비밀번호를 입력해주세요.');
        try {
          await signInWithEmailAndPassword(auth, email, password);
          navigate('/');
        } catch (error) {
          alert(firebaseErrorMessage(error));
        }
      }}>로그인</button>
      <AuthSwitch sign={false} />
      <SocialButtons />
    </AuthLayout>
  );
}
