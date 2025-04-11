package com.trading212.backend.controller;

import com.trading212.backend.dto.RegisterRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AccountInfo {


    @PostMapping("/user/balance")
    public ResponseEntity<String> getBalance(@RequestBody RegisterRequest request){

        return ResponseEntity.ok("Register successful");
    }
}
