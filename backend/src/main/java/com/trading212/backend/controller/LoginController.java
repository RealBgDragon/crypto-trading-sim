package com.trading212.backend.controller;

import com.trading212.backend.dto.RegisterRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class LoginController {

    @PostMapping("/login")
    public String login(){
        System.out.println("Login");
        return "Login";
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request){
        String email = request.getEmail();
        String password = request.getPassword();
        String username = request.getUsername(); // Might be null in login

        // Handle logic here...
        System.out.println("Email: " + email);
        System.out.println("Password: " + password);
        System.out.println("Username: " + username);

        return "Success";
    }
}
