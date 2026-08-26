import { auth } from './firebase';

// 로컬 개발: vite proxy가 /api를 8080으로 전달하므로 빈 문자열
// 배포(Vercel): .env.production에 VITE_API_BASE=https://tripify-xxxx.onrender.com 설정
const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (auth.currentUser) {
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    let message = `요청 실패 (${res.status})`;
    try {
      message = (await res.json()).message || message;
    } catch (_) {}
    throw new Error(message);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const esc = s =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const won = n => '₩' + Number(n || 0).toLocaleString('ko-KR');

export const dday = dateStr => {
  if (!dateStr) return '';
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  return diff > 0 ? `D-${diff}` : diff === 0 ? 'D-DAY' : `D+${-diff}`;
};

export function firebaseErrorMessage(error) {
  const code = error?.code || '';
  if (code.includes('email-already-in-use')) return '이미 가입된 이메일입니다.';
  if (code.includes('invalid-email')) return '올바른 이메일 형식이 아닙니다.';
  if (code.includes('weak-password')) return '비밀번호는 6자 이상이어야 합니다.';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }
  if (code.includes('popup-blocked')) return '팝업이 차단되었습니다. 팝업을 허용해주세요.';
  if (code.includes('unauthorized-domain')) return '이 도메인은 Firebase에 등록되지 않았습니다. 콘솔에서 도메인을 추가해주세요.';
  return error?.message || '오류가 발생했습니다.';
}
