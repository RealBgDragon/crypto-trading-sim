package com.trading212.backend.repository;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc){
        this.jdbc = jdbc;
    }

    public String saveUser(String email, String password, String username){
        try {
            String sql = "INSERT INTO users (email, password, username) VALUES (?, ?, ?)";
            jdbc.update(sql, email, password, username);
            return "Success";
        } catch (DuplicateKeyException e){
            return "Email already exists";
        } catch (DataAccessException e){
            return "Database error. Could not save user";
        }
    }

    public String checkUser(String email){
        String sql = "SELECT password FROM users WHERE email = ?";
        try {
            return jdbc.queryForObject(sql, String.class, email);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }
}
