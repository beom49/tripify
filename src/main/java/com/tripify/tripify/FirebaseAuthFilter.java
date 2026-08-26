package com.tripify.tripify;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class FirebaseAuthFilter extends OncePerRequestFilter {

    public static final String UID_ATTRIBUTE = "uid";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            try {
                FirebaseToken token = FirebaseAuth.getInstance()
                        .verifyIdToken(header.substring(7), true);
                request.setAttribute(UID_ATTRIBUTE, token.getUid());
            } catch (Exception e) {
                log.debug("ID 토큰 검증 실패: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
