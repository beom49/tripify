package com.tripify.tripify;

import org.springframework.stereotype.Component;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class FirestoreProvider {

    private final FirebaseConfig firebaseConfig;

    public Firestore get() {
        if (!firebaseConfig.isInitialized()) {
            throw new IllegalStateException(
                    "Firebase가 초기화되지 않았습니다. FIREBASE_SERVICE_ACCOUNT_KEY 환경변수에 Admin SDK 키 JSON 경로를 설정하세요.");
        }
        return FirestoreClient.getFirestore();
    }
}
