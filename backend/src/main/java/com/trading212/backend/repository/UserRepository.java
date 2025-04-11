package com.trading212.backend.repository;

import com.trading212.backend.dto.UserDTO;
import org.apache.catalina.User;
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

    public UserDTO checkUser(String email){
        String sql = "SELECT password, id, username FROM users WHERE email = ?";
        try {
            return jdbc.queryForObject(sql, (rs, rowNum) -> {
                UserDTO userDTO = new UserDTO();
                userDTO.setPassword(rs.getString("password"));
                userDTO.setUsername(rs.getString("username"));
                userDTO.setId(rs.getInt("id"));
                return userDTO;
            }, email);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }
}
