package com.tripify.tripify;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public List<Expense> list(@PathVariable String tripId, HttpServletRequest request) {
        return expenseService.list(TripController.currentUid(request), tripId);
    }

    @PostMapping
    public Expense add(@PathVariable String tripId,
            @RequestBody ExpenseService.ExpenseRequest body,
            HttpServletRequest request) {
        return expenseService.add(TripController.currentUid(request), tripId, body);
    }

    @DeleteMapping("/{expenseId}")
    public void delete(@PathVariable String tripId, @PathVariable String expenseId,
            HttpServletRequest request) {
        expenseService.delete(TripController.currentUid(request), tripId, expenseId);
    }
}
