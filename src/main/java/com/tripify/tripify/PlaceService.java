package com.tripify.tripify;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.ExecutionException;

import org.springframework.stereotype.Service;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final FirestoreProvider fdb;

    public static final String COLLECTION = "places";

    private Firestore db() {
        return fdb.get();
    }

    public List<Place> getAllPlaces() {
        try {
            return db().collection(COLLECTION)
                    .orderBy("createdAt")
                    .get().get().getDocuments().stream()
                    .map(PlaceService::toPlace)
                    .toList();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("장소 목록 조회 중 오류가 발생했습니다.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("장소 목록 조회 중 오류가 발생했습니다.", e);
        }
    }

    public Place getPlace(String placeId) {
        try {
            DocumentSnapshot doc = db().collection(COLLECTION).document(placeId).get().get();
            if (!doc.exists()) {
                throw new NotFoundException("장소를 찾을 수 없습니다.");
            }
            return toPlace(doc);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("장소 조회 중 오류가 발생했습니다.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("장소 조회 중 오류가 발생했습니다.", e);
        }
    }

    public Place savePlace(Place place) {
        if (place.getName() == null || place.getName().isBlank()) {
            throw new BadRequestException("장소 이름을 입력해주세요.");
        }
        place.setCreatedAt(Instant.now().toString());
        try {
            String id = db().collection(COLLECTION).add(place).get().getId();
            place.setPlaceId(id);
            return place;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("장소 저장 중 오류가 발생했습니다.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("장소 저장 중 오류가 발생했습니다.", e);
        }
    }

    static Place toPlace(DocumentSnapshot doc) {
        Place place = doc.toObject(Place.class);
        place.setPlaceId(doc.getId());
        return place;
    }
}
