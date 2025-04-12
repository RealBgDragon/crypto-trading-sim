package com.trading212.backend.dto;

public class BalanceRequest {

    private int userId; // This can be null if it's a login

    // Getters and Setters
    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

}
