package com.trading212.backend.dto;

public class LoginResponseDTO {
    private int id;
    private String username;

    public LoginResponseDTO(int id, String username) {
        this.id = id;
        this.username = username;
    }

    public int getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }
}
