package com.tripify.tripify;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutionException;

import org.springframework.stereotype.Service;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final FirestoreProvider fdb;
    private final TripService tripService;

    public static final String COLLECTION = "expenses";

    public static final String[] CATEGORIES = {"숙소", "교통", "식비", "관광·쇼핑"};

    private Firestore db() {
        return fdb.get();
    }

    @lombok.Data
    public static class ExpenseRequest {
        private String category;
        private String item;
        private Long amount;
    }

    public List<Expense> list(String uid, String tripId) {
        try {
            return db().collection(COLLECTION)
                    .whereEqualTo("tripId", tripId)
                    .orderBy("createdAt", Query.Direction.ASCENDING)
                    .get().get().getDocuments().stream()
                    .map(ExpenseService::toExpense)
                    .toList();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("경비 조회 중 오류가 발생했습니다.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("경비 조회 중 오류가 발생했습니다.", e);
        }
    }

    public Expense add(String uid, String tripId, ExpenseRequest request) {
        requireOwned(uid, tripId);

        if (request.getItem() == null || request.getItem().isBlank()) {
            throw new BadRequestException("경비 항목을 입력해주세요.");
        }
        if (request.getAmount() == null || request.getAmount() < 0) {
            throw new BadRequestException("올바른 금액을 입력해주세요.");
        }
        if (!Arrays.asList(CATEGORIES).contains(request.getCategory())) {
            throw new BadRequestException("올바른 카테고리를 선택해주세요.");
        }

        Expense expense = new Expense();
        expense.setTripId(tripId);
        expense.setCategory(request.getCategory());
        expense.setItem(request.getItem());
        expense.setAmount(request.getAmount());
        expense.setCreatedAt(Instant.now().toString());

        try {
            String id = db().collection(COLLECTION).add(expense).get().getId();
            expense.setExpenseId(id);
            return expense;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("경비 추가 중 오류가 발생했습니다.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("경비 추가 중 오류가 발생했습니다.", e);
        }
    }

    public void delete(String uid, String tripId, String expenseId) {
        requireOwned(uid, tripId);
        try {
            DocumentSnapshot doc = db().collection(COLLECTION).document(expenseId).get().get();
            if (!doc.exists() || !tripId.equals(doc.getString("tripId"))) {
                throw new NotFoundException("경비를 찾을 수 없습니다.");
            }
            db().collection(COLLECTION).document(expenseId).delete().get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("경비 삭제 중 오류가 발생했습니다.", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("경비 삭제 중 오류가 발생했습니다.", e);
        }
    }

    private void requireOwned(String uid, String tripId) {
        tripService.getOwned(uid, tripId);
    }

    static Expense toExpense(DocumentSnapshot doc) {
        Expense expense = doc.toObject(Expense.class);
        expense.setExpenseId(doc.getId());
        return expense;
    }
}
