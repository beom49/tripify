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
public class ScheduleService {

    private final FirestoreProvider fdb;
    private final TripService tripService;

    public static final String COLLECTION = "schedules";

    private Firestore db() {
        return fdb.get();
    }

    @lombok.Data
    public static class ScheduleRequest {
        private Integer day;
        private String time;
        private String title;
        private String memo;
    }

    public List<Schedule> list(String uid, String tripId) {
        requireOwned(uid, tripId);
        try {
            return db().collection(COLLECTION)
                    .whereEqualTo("tripId", tripId)
                    .orderBy("day", Query.Direction.ASCENDING)
                    .orderBy("time", Query.Direction.ASCENDING)
                    .get().get().getDocuments().stream()
                    .map(ScheduleService::toSchedule)
                    .toList();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("일정 조회 중 오류가 발생했습니다.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("일정 조회 중 오류가 발생했습니다.", e);
        }
    }

    public Schedule add(String uid, String tripId, ScheduleRequest request) {
        requireOwned(uid, tripId);

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new BadRequestException("일정 제목을 입력해주세요.");
        }
        if (request.getDay() == null || request.getDay() < 1) {
            throw new BadRequestException("올바른 일차를 선택해주세요.");
        }

        Schedule schedule = new Schedule();
        schedule.setTripId(tripId);
        schedule.setDay(request.getDay());
        schedule.setTime(request.getTime() != null ? request.getTime() : "");
        schedule.setTitle(request.getTitle());
        schedule.setMemo(request.getMemo());
        schedule.setCreatedAt(Instant.now().toString());

        try {
            String id = db().collection(COLLECTION).add(schedule).get().getId();
            schedule.setScheduleId(id);
            return schedule;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("일정 추가 중 오류가 발생했습니다.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("일정 추가 중 오류가 발생했습니다.", e);
        }
    }

    public void delete(String uid, String tripId, String scheduleId) {
        requireOwned(uid, tripId);
        try {
            DocumentSnapshot doc = db().collection(COLLECTION).document(scheduleId).get().get();
            if (!doc.exists() || !tripId.equals(doc.getString("tripId"))) {
                throw new NotFoundException("일정을 찾을 수 없습니다.");
            }
            db().collection(COLLECTION).document(scheduleId).delete().get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("일정 삭제 중 오류가 발생했습니다.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("일정 삭제 중 오류가 발생했습니다.", e);
        }
    }

    private void requireOwned(String uid, String tripId) {
        tripService.getOwned(uid, tripId);
    }

    static Schedule toSchedule(DocumentSnapshot doc) {
        Schedule schedule = doc.toObject(Schedule.class);
        schedule.setScheduleId(doc.getId());
        return schedule;
    }
}
