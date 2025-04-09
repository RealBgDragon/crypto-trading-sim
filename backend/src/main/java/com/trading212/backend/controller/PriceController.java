package com.trading212.backend.controller;

import com.trading212.backend.dto.PriceDTO;
import com.trading212.backend.service.PriceService;
import com.trading212.backend.service.WebSocketClientService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @GetMapping("/start")
    public String startWebSocket(){
        webSocketClientService.connectToKraken();
        return "Connected to Kraken WebSocket!";
    }

    @GetMapping("/price/{pair}")
    public PriceDTO getPrice(@PathVariable String pair){
        pair = pair.replace("_", "/");
        return priceService.getLatestPrice(pair);
    }

    @GetMapping("/stop")
    public String stopWebSocket(){
        webSocketClientService.closeConnection();
        return "WebSocket connection closed";
    }

}
