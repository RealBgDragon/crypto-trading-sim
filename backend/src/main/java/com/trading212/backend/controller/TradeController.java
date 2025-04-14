package com.trading212.backend.controller;

import com.trading212.backend.dto.TradeRequest;
import com.trading212.backend.repository.TradeRepository;
import com.trading212.backend.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/trade")
public class TradeController {

    @Autowired
    private TradeRepository tradeRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @PostMapping("/buy")
    public ResponseEntity<?> buyCrypto(@RequestBody TradeRequest request) {
        // Validate input
        if (request.getUserId() <= 0 || request.getCryptoSymbol() == null ||
                request.getAmount() <= 0 || request.getPriceAtTransaction() <= 0) {
            return ResponseEntity.badRequest().body("Invalid trade parameters");
        }

        // Calculate total value
        double totalValue = request.getAmount() * request.getPriceAtTransaction();

        // Check if user has enough balance
        Double currentBalance = userAccountRepository.getUserBalance(request.getUserId());
        if (currentBalance == -1.0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        if (currentBalance < totalValue) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Insufficient balance");
        }

        // Execute the trade
        try {
            // Update user balance
            double newBalance = currentBalance - totalValue;
            String balanceUpdateResult = userAccountRepository.updateUserBalance(request.getUserId(), newBalance);

            if (!balanceUpdateResult.equals("Success")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update balance");
            }

            // Record the transaction
            String transactionResult = tradeRepository.recordTransaction(
                    request.getUserId(),
                    request.getCryptoSymbol(),
                    request.getAmount(),
                    request.getPriceAtTransaction(),
                    totalValue,
                    "BUY",
                    LocalDateTime.now()
            );

            if (!transactionResult.equals("Success")) {
                // Rollback balance change
                userAccountRepository.updateUserBalance(request.getUserId(), currentBalance);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to record transaction");
            }

            // Update holdings
            String holdingsResult = tradeRepository.updateHoldings(
                    request.getUserId(),
                    request.getCryptoSymbol(),
                    request.getAmount()
            );

            if (!holdingsResult.equals("Success")) {
                // This is critical - rollback everything
                userAccountRepository.updateUserBalance(request.getUserId(), currentBalance);
                tradeRepository.rollbackLastTransaction(request.getUserId());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update holdings");
            }

            // Return updated balance and holdings
            Map<String, Object> currentHolding = tradeRepository.getUserCryptoHolding(
                    request.getUserId(),
                    request.getCryptoSymbol()
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "newBalance", newBalance,
                    "holding", currentHolding
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing transaction: " + e.getMessage());
        }
    }

    // Add this method to TradeController.java
    @PostMapping("/sell")
    public ResponseEntity<?> sellCrypto(@RequestBody TradeRequest request) {
        // Validate input
        if (request.getUserId() <= 0 || request.getCryptoSymbol() == null ||
                request.getAmount() <= 0 || request.getPriceAtTransaction() <= 0) {
            return ResponseEntity.badRequest().body("Invalid trade parameters");
        }

        // Calculate total value
        double totalValue = request.getAmount() * request.getPriceAtTransaction();

        // Check if user has enough of the crypto to sell
        Map<String, Object> currentHolding = tradeRepository.getUserCryptoHolding(
                request.getUserId(),
                request.getCryptoSymbol()
        );

        double currentAmount = currentHolding.containsKey("amount") ?
                ((Number) currentHolding.get("amount")).doubleValue() : 0.0;

        if (currentAmount < request.getAmount()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Insufficient crypto balance");
        }

        // Execute the trade
        try {
            // Get current user balance
            Double currentBalance = userAccountRepository.getUserBalance(request.getUserId());
            if (currentBalance == -1.0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            // Update user balance
            double newBalance = currentBalance + totalValue;
            String balanceUpdateResult = userAccountRepository.updateUserBalance(
                    request.getUserId(),
                    newBalance
            );

            if (!balanceUpdateResult.equals("Success")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to update balance");
            }

            // Record the transaction
            String transactionResult = tradeRepository.recordTransaction(
                    request.getUserId(),
                    request.getCryptoSymbol(),
                    request.getAmount(),
                    request.getPriceAtTransaction(),
                    totalValue,
                    "SELL",
                    LocalDateTime.now()
            );

            if (!transactionResult.equals("Success")) {
                // Rollback balance change
                userAccountRepository.updateUserBalance(request.getUserId(), currentBalance);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to record transaction");
            }

            // Update holdings - notice the negative amount for selling
            String holdingsResult = tradeRepository.updateHoldingsSell(
                    request.getUserId(),
                    request.getCryptoSymbol(),
                    request.getAmount()
            );

            if (!holdingsResult.equals("Success")) {
                // Rollback everything
                userAccountRepository.updateUserBalance(request.getUserId(), currentBalance);
                tradeRepository.rollbackLastTransaction(request.getUserId());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to update holdings");
            }

            // Calculate profit/loss data
            Map<String, Object> profitLossData = tradeRepository.calculateProfitLoss(
                    request.getUserId(),
                    request.getCryptoSymbol(),
                    request.getAmount(),
                    request.getPriceAtTransaction()
            );

            // Return updated balance, holdings, and profit/loss
            Map<String, Object> updatedHolding = tradeRepository.getUserCryptoHolding(
                    request.getUserId(),
                    request.getCryptoSymbol()
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "newBalance", newBalance,
                    "holding", updatedHolding,
                    "profitLoss", profitLossData
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing transaction: " + e.getMessage());
        }
    }

    @GetMapping("/holdings/{userId}")
    public ResponseEntity<?> getUserHoldings(@PathVariable int userId) {
        try {
            return ResponseEntity.ok(tradeRepository.getAllUserHoldings(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching holdings: " + e.getMessage());
        }
    }

    @GetMapping("/transactions/{userId}")
    public ResponseEntity<?> getUserTransactions(@PathVariable int userId) {
        try {
            return ResponseEntity.ok(tradeRepository.getUserTransactions(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching transactions: " + e.getMessage());
        }
    }
}