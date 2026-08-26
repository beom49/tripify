package com.tripify.tripify;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @GetMapping("/api/auth/me")
    public ResponseEntity<User> me(HttpServletRequest request) {
        Object uid = request.getAttribute(FirebaseAuthFilter.UID_ATTRIBUTE);
        if (uid == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
        return ResponseEntity.ok(userService.findByUid(uid.toString()));
    }
}
