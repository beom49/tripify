import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { firebaseErrorMessage } from '../api';
import { AuthLayout, AuthSwitch } from './Login.jsx';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthLayout sign>
      <h1>Tripify와 함께 떠나요!</h1>
      <p className="muted">몇 가지 정보만 입력하면 바로 시작할 수 있어요.</p>
      <label>이름</label>
      <input placeholder="이름을 입력해주세요" value={name} onChange={e => setName(e.target.value)} />
      <label>이메일 주소</label>
      <input placeholder="example@tripify.com" value={email} onChange={e => setEmail(e.target.value)} />
      <label>비밀번호</label>
      <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="primary" onClick={async () => {
        if (!name || !email || !password) return alert('이름, 이메일, 비밀번호를 모두 입력해주세요.');
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(cred.user, { displayName: name });
          navigate('/');
        } catch (error) {
          alert(firebaseErrorMessage(error));
        }
      }}>회원가입</button>
      <AuthSwitch sign />
      <div className="social">
        <button disabled>◉ Kakao</button>
        <button disabled>◉ Naver</button>
        <button disabled>◉ Google</button>
      </div>
    </AuthLayout>
  );
}
