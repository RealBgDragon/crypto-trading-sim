package com.trading212.backend.repository;

import com.trading212.backend.dto.UserDTO;
import org.apache.catalina.User;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc){
        this.jdbc = jdbc;
    }

    public String saveUser(String email, String password, String username){

        try {
            // Insert the user
            String userSql = "INSERT INTO users (email, password, username) VALUES (?, ?, ?)";
            KeyHolder keyHolder = new GeneratedKeyHolder();

            jdbc.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(userSql, Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, email);
                ps.setString(2, password);
                ps.setString(3, username);
                return ps;
            }, keyHolder);

            // Get the generated user ID
            Long userId = keyHolder.getKey().longValue();

            // Insert into account_balance table
            String balanceSql = "INSERT INTO account_balance (user_id, balance) VALUES (?, ?)";
            jdbc.update(balanceSql, userId, 10000);

            // Commit the transaction

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
