package com.trading212.backend.repository;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public class TradeRepository {

    private final JdbcTemplate jdbc;

    public TradeRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    //Records a new transaction in the transactions table
    public String recordTransaction(int userId, String cryptoSymbol, double amount,
                                    double priceAtTransaction, double totalValue,
                                    String transactionType, LocalDateTime timestamp) {
        String sql = "INSERT INTO transactions (user_id, crypto_symbol, amount, " +
                "price_at_transaction, total_value, transaction_type, timestamp) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";
        try {
            jdbc.update(sql, userId, cryptoSymbol, amount, priceAtTransaction,
                    totalValue, transactionType, timestamp);
            return "Success";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    //Updates user holdings after a transaction
    @Transactional
    public String updateHoldings(int userId, String cryptoSymbol, double amount) {
        try {
            // Check if user already has this crypto
            String checkSql = "SELECT amount FROM holdings WHERE user_id = ? AND crypto_symbol = ?";
            Double currentAmount = null;

            try {
                currentAmount = jdbc.queryForObject(checkSql, Double.class, userId, cryptoSymbol);
            } catch (EmptyResultDataAccessException e) {
                // No existing holding found
                currentAmount = null;
            }

            if (currentAmount == null) {
                // Insert new holding
                String insertSql = "INSERT INTO holdings (user_id, crypto_symbol, amount) VALUES (?, ?, ?)";
                jdbc.update(insertSql, userId, cryptoSymbol, amount);
            } else {
                // Update existing holding
                String updateSql = "UPDATE holdings SET amount = amount + ? WHERE user_id = ? AND crypto_symbol = ?";
                jdbc.update(updateSql, amount, userId, cryptoSymbol);
            }
            return "Success";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    // Add these methods to TradeRepository.java

    // Updates holdings after a sell transaction
    @Transactional
    public String updateHoldingsSell(int userId, String cryptoSymbol, double amount) {
        try {
            // Get current holding
            String checkSql = "SELECT amount FROM holdings WHERE user_id = ? AND crypto_symbol = ?";
            Double currentAmount;

            try {
                currentAmount = jdbc.queryForObject(checkSql, Double.class, userId, cryptoSymbol);
            } catch (EmptyResultDataAccessException e) {
                return "Error: No holdings found";
            }

            if (currentAmount == null || currentAmount < amount) {
                return "Error: Insufficient balance";
            }

            double newAmount = currentAmount - amount;

            // Update or remove the holding
            if (newAmount > 0.00000001) { // Keep a small threshold to handle floating point issues
                String updateSql = "UPDATE holdings SET amount = ? WHERE user_id = ? AND crypto_symbol = ?";
                jdbc.update(updateSql, newAmount, userId, cryptoSymbol);
            } else {
                // Remove the holding completely if amount is effectively zero
                String deleteSql = "DELETE FROM holdings WHERE user_id = ? AND crypto_symbol = ?";
                jdbc.update(deleteSql, userId, cryptoSymbol);
            }

            return "Success";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    // Calculate profit/loss for a sell transaction
    public Map<String, Object> calculateProfitLoss(int userId, String cryptoSymbol,
                                                   double amountSold, double currentPrice) {
        try {
            // Query for buy transactions to calculate average purchase price
            String sql = "SELECT AVG(price_at_transaction) as avg_price, " +
                    "SUM(amount) as total_bought " +
                    "FROM transactions " +
                    "WHERE user_id = ? AND crypto_symbol = ? AND transaction_type = 'BUY'";

            Map<String, Object> result = jdbc.queryForMap(sql, userId, cryptoSymbol);

            Double avgBuyPrice = ((Number) result.get("avg_price")).doubleValue();

            // Calculate profit/loss
            double buyValue = avgBuyPrice * amountSold;
            double sellValue = currentPrice * amountSold;
            double profitLoss = sellValue - buyValue;
            double profitLossPercentage = (profitLoss / buyValue) * 100;

            return Map.of(
                    "averageBuyPrice", avgBuyPrice,
                    "sellPrice", currentPrice,
                    "amount", amountSold,
                    "profitLoss", profitLoss,
                    "profitLossPercentage", profitLossPercentage,
                    "isProfitable", profitLoss >= 0
            );
        } catch (Exception e) {
            return Map.of(
                    "error", "Could not calculate profit/loss: " + e.getMessage(),
                    "isProfitable", false
            );
        }
    }

    //Rollback the most recent transaction for a user (for error handling)
    public void rollbackLastTransaction(int userId) {
        String sql = "DELETE FROM transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1";
        jdbc.update(sql, userId);
    }

    //Get specific crypto holding for a user
    public Map<String, Object> getUserCryptoHolding(int userId, String cryptoSymbol) {
        String sql = "SELECT id, user_id, crypto_symbol, amount FROM holdings " +
                "WHERE user_id = ? AND crypto_symbol = ?";
        try {
            return jdbc.queryForMap(sql, userId, cryptoSymbol);
        } catch (EmptyResultDataAccessException e) {
            return Map.of("user_id", userId, "crypto_symbol", cryptoSymbol, "amount", 0.0);
        }
    }

    //Get all holdings for a user
    public List<Map<String, Object>> getAllUserHoldings(int userId) {
        String sql = "SELECT id, user_id, crypto_symbol, amount FROM holdings WHERE user_id = ?";
        return jdbc.queryForList(sql, userId);
    }

    //Get all transactions for a user
    public List<Map<String, Object>> getUserTransactions(int userId) {
        String sql = "SELECT id, user_id, crypto_symbol, amount, price_at_transaction, " +
                "total_value, transaction_type, timestamp FROM transactions " +
                "WHERE user_id = ? ORDER BY timestamp DESC";
        return jdbc.queryForList(sql, userId);
    }
}