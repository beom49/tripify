package com.tripify.tripify;

import java.io.FileInputStream;
import java.io.FileNotFoundException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class FirebaseConfig {

    @Value("${firebase.service-account-key:}")
    private String serviceAccountKeyPath;

    private volatile boolean initialized = false;

    @PostConstruct
    public void init() {
        if (!FirebaseApp.getApps().isEmpty()) {
            initialized = true;
            return;
        }

        try {
            FirebaseOptions options;

            if (serviceAccountKeyPath != null && !serviceAccountKeyPath.isBlank()) {
                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(new FileInputStream(serviceAccountKeyPath)))
                        .build();
            } else if (System.getenv("GOOGLE_APPLICATION_CREDENTIALS") != null) {
                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.getApplicationDefault())
                        .build();
            } else {
                log.warn("Firebase 서비스 계정 키가 설정되지 않았습니다. "
                        + "FIREBASE_SERVICE_ACCOUNT_KEY 환경변수에 Admin SDK 키 JSON 경로를 지정하세요.");
                return;
            }

            FirebaseApp.initializeApp(options);
            initialized = true;
            log.info("Firebase Admin SDK 초기화 완료");
        } catch (FileNotFoundException e) {
            log.error("Firebase 서비스 계정 키 파일을 찾을 수 없습니다: {}", serviceAccountKeyPath);
        } catch (Exception e) {
            log.error("Firebase 초기화 실패", e);
        }
    }

    public boolean isInitialized() {
        return initialized;
    }
}
