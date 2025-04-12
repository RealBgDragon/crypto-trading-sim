package com.trading212.backend.controller;

import com.trading212.backend.dto.PriceDTO;
import com.trading212.backend.service.PriceService;
import com.trading212.backend.service.WebSocketClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.support.NullValue;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PriceController {

    @Autowired
    private WebSocketClientService webSocketClientService;

    @Autowired
    private PriceService priceService;

    @GetMapping("/status")
    public ResponseEntity<?> getConnectionStatus() {
        if(webSocketClientService.isConnected()){
            return ResponseEntity.ok("API is connected!");
        } else {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("API is not connected!");
        }

    }

    @GetMapping("/price/{pair}")
    public PriceDTO getPrice(@PathVariable String pair){
        pair = pair.replace("_", "/");
        try {
            return priceService.getLatestPrice(pair);
        }catch (NullPointerException e){
            System.out.println(e);
        }
        return null;
    }

    @GetMapping("/stop")
    public String stopWebSocket(){
        webSocketClientService.closeConnection();
        return "WebSocket connection closed";
    }

}
