package com.trading212.backend.controller;

import com.trading212.backend.dto.BalanceRequest;
import com.trading212.backend.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/api")
public class AccountInfo {

    @Autowired
    private UserAccountRepository userAccountRepository;

    @PostMapping("/user/balance")
    public ResponseEntity<?> getBalance(@RequestBody BalanceRequest request){
        System.out.println(request.getUserId());
        double balance = userAccountRepository.getUserBalance(request.getUserId());
        if (balance != -1.0){
            return ResponseEntity.ok(balance);
        } else{
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Error getting user balance");
        }
    }

    @PostMapping("/user/balance/recover")
    public ResponseEntity<?> resetBalance(@RequestBody BalanceRequest request){
        System.out.println(request.getUserId());
        if (Objects.equals(userAccountRepository.setUserBalance(request.getUserId()), "Success")){
            return ResponseEntity.ok("Balance updated");
        } else{
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Error updating user balance");
        }
    }
}
