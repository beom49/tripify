package com.tripify.tripify;

import lombok.Data;

@Data
public class Expense {

    private String expenseId;
    private String tripId;
    private String category;
    private String item;
    private Long amount;
    private String createdAt;
}
