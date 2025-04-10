package com.trading212.backend.controller;

import com.trading212.backend.dto.RegisterRequest;
import com.trading212.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody RegisterRequest request){
        String email = request.getEmail();
        String password = request.getPassword();
        String userPassword = userRepository.checkUser(email);

        if (userPassword == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email not found");
        }

        if (password.equals(userPassword)) {
            return ResponseEntity.ok("Login successful");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request){
        String email = request.getEmail();
        String password = request.getPassword();
        String username = request.getUsername();

        if(userRepository.saveUser(email, password, username) == "Success"){
            return ResponseEntity.ok("Register successful");
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already taken");
        }

    }
}
