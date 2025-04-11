package com.trading212.backend.repository;


import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserAccountRepository {

    private final JdbcTemplate jdbc;

    public UserAccountRepository(JdbcTemplate jdbc){
        this.jdbc = jdbc;
    }

    public String getUserBalance(int user_id){
        String sql = "SELECT password FROM users WHERE id = ?";
        try{
            return jdbc.queryForObject(sql, String.class, user_id);
        } catch (EmptyResultDataAccessException e){
            return null;
        }
    }

}
