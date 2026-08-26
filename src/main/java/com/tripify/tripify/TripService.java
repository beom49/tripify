package com.tripify.tripify;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.ExecutionException;

import org.springframework.stereotype.Service;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripService {

    private final FirestoreProvider fdb;

    public static final String COLLECTION = "trips";

    private Firestore db() {
        return fdb.get();
    }

    @lombok.Data
    public static class TripRequest {
        private String title;
        private String destination;
        private String startDate;
        private String endDate;
        private Integer companions;
        private String intro;
    }

    public List<Trip> getMyTrips(String uid) {
        try {
            return db().collection(COLLECTION)
                    .whereEqualTo("ownerUid", uid)
                    .orderBy("createdAt", Query.Direction.DESCENDING)
                    .get().get().getDocuments().stream()
                    .map(TripService::toTrip)
                    .toList();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("여행 목록 조회 중 오류가 발생했습니다.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("여행 목록 조회 중 오류가 발생했습니다.", e);
        }
    }

    public Trip create(String uid, TripRequest request) {
        validate(request);

        Trip trip = new Trip();
        trip.setOwnerUid(uid);
        trip.setTitle(request.getTitle());
        trip.setDestination(request.getDestination());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setCompanions(request.getCompanions() != null ? request.getCompanions() : 1);
        trip.setIntro(request.getIntro());
        trip.setCreatedAt(Instant.now().toString());

        try {
            String id = db().collection(COLLECTION).add(trip).get().getId();
            trip.setTripId(id);
            return trip;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("여행 생성 중 오류가 발생했습니다.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("여행 생성 중 오류가 발생했습니다.", e);
        }
    }

    public Trip getOwned(String uid, String tripId) {
        try {
            DocumentSnapshot doc = db().collection(COLLECTION).document(tripId).get().get();
            if (!doc.exists()) {
                throw new NotFoundException("여행을 찾을 수 없습니다.");
            }
            Trip trip = toTrip(doc);
            if (!uid.equals(trip.getOwnerUid())) {
                throw new ForbiddenException("본인의 여행만 접근할 수 있습니다.");
            }
            return trip;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("여행 조회 중 오류가 발생했습니다.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("여행 조회 중 오류가 발생했습니다.", e);
        }
    }

    public void delete(String uid, String tripId) {
        getOwned(uid, tripId);

        try {
            deleteSubcollections(tripId, ScheduleService.COLLECTION);
            deleteSubcollections(tripId, ExpenseService.COLLECTION);
            db().collection(COLLECTION).document(tripId).delete().get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("여행 삭제 중 오류가 발생했습니다.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("여행 삭제 중 오류가 발생했습니다.", e);
        }
    }

    private void deleteSubcollections(String tripId, String collection) throws InterruptedException, ExecutionException {
        var docs = db().collection(collection).whereEqualTo("tripId", tripId).get().get().getDocuments();
        for (var doc : docs) {
            doc.getReference().delete();
        }
    }

    private void validate(TripRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new BadRequestException("여행 이름을 입력해주세요.");
        }
        if (request.getDestination() == null || request.getDestination().isBlank()) {
            throw new BadRequestException("여행지를 입력해주세요.");
        }
    }

    static Trip toTrip(DocumentSnapshot doc) {
        Trip trip = doc.toObject(Trip.class);
        trip.setTripId(doc.getId());
        return trip;
    }
}
