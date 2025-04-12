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

    public Double getUserBalance(int userId){
        String sql = "SELECT balance FROM account_balance WHERE user_id = ?";
        try{
            return jdbc.queryForObject(sql, Double.class, userId);
        } catch (EmptyResultDataAccessException e){
            return -1.0;
        }
    }

    public String setUserBalance(int userId){
        String sql = "UPDATE account_balance SET balance = ?  WHERE user_id = ?";
        try{
            jdbc.update(sql, 10000, userId);
            return "Success";
        } catch (EmptyResultDataAccessException e){
            return "No such user";
        } catch (Exception e){
            return "Error";
        }
    }

}
