package com.tripify.tripify;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import org.springframework.stereotype.Service;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final FirestoreProvider fdb;
    private final FirebaseConfig firebaseConfig;

    public static final String COLLECTION = "users";

    private Firestore db() {
        return fdb.get();
    }

    public User upsert(User user) {
        try {
            DocumentSnapshot doc = db().collection(COLLECTION).document(user.getUid()).get().get();
            Instant now = Instant.now();

            if (doc.exists()) {
                Map<String, Object> updates = new java.util.HashMap<>();
                if (user.getEmail() != null && !user.getEmail().equals(doc.getString("email"))) {
                    updates.put("email", user.getEmail());
                }
                if (user.getName() != null && !user.getName().equals(doc.getString("name"))) {
                    updates.put("name", user.getName());
                }
                if (user.getPicture() != null) {
                    updates.put("picture", user.getPicture());
                }
                updates.put("provider", user.getProvider());
                if (!updates.isEmpty()) {
                    db().collection(COLLECTION).document(user.getUid()).update(updates).get();
                }

                User result = new User();
                result.setUid(user.getUid());
                result.setEmail(doc.getString("email"));
                result.setName(updates.getOrDefault("name", doc.getString("name")).toString());
                result.setPicture((String) updates.getOrDefault("picture", doc.getString("picture")));
                result.setProvider(user.getProvider());
                result.setCreatedAt(doc.getString("createdAt"));
                return result;
            }

            user.setCreatedAt(now.toString());
            db().collection(COLLECTION).document(user.getUid()).set(user).get();
            return user;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("사용자 저장 중 오류가 발생했습니다.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("사용자 저장 중 오류가 발생했습니다.", e);
        }
    }

    public User findByUid(String uid) {
        try {
            DocumentSnapshot doc = db().collection(COLLECTION).document(uid).get().get();
            if (!doc.exists()) {
                throw new NotFoundException("사용자를 찾을 수 없습니다.");
            }
            return doc.toObject(User.class);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("사용자 조회 중 오류가 발생했습니다.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("사용자 조회 중 오류가 발생했습니다.", e);
        }
    }
}
