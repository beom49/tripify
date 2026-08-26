package com.tripify.tripify;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final FirebaseConfig firebaseConfig;

    public record SessionRequest(String idToken) {
    }

    @PostMapping("/session")
    public ResponseEntity<User> createSession(@RequestBody SessionRequest request,
            HttpServletRequest httpRequest) {
        requireFirebase();

        try {
            FirebaseToken token = FirebaseAuth.getInstance().verifyIdToken(request.idToken(), true);

            User user = User.from(
                    token.getUid(),
                    token.getEmail(),
                    token.getName() != null ? token.getName() : (token.getEmail() != null
                            ? token.getEmail().substring(0, token.getEmail().indexOf('@'))
                            : "여행자"),
                    token.getPicture(),
                    extractProvider(token));

            User saved = userService.upsert(user);

            httpRequest.getSession(true).setAttribute(AuthSupport.SESSION_UID, saved.getUid());
            return ResponseEntity.ok(saved);
        } catch (com.google.firebase.auth.FirebaseAuthException e) {
            throw new UnauthorizedException("인증 토큰이 유효하지 않습니다.");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<User> me(HttpServletRequest request) {
        String uid = currentUid(request);
        if (uid == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
        return ResponseEntity.ok(userService.findByUid(uid));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("message", "로그아웃되었습니다."));
    }

    private String currentUid(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session == null) {
            return null;
        }
        Object uid = session.getAttribute(AuthSupport.SESSION_UID);
        return uid != null ? uid.toString() : null;
    }

    private void requireFirebase() {
        if (!firebaseConfig.isInitialized()) {
            throw new IllegalStateException("Firebase가 초기화되지 않았습니다. 서비스 계정 키를 설정하세요.");
        }
    }

    private String extractProvider(FirebaseToken token) {
        Object firebaseClaim = token.getClaims().get("firebase");
        if (firebaseClaim instanceof Map<?, ?> map && map.get("sign_in_provider") != null) {
            return map.get("sign_in_provider").toString();
        }
        return "unknown";
    }
}
