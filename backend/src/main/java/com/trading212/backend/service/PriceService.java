package com.trading212.backend.service;

import com.trading212.backend.dto.PriceDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PriceService {
    private PriceDTO latestPrice;

    private final Map<String, List<PriceDTO>> priceHistory = new ConcurrentHashMap<>();

    public void updatePrice(PriceDTO priceDTO){
        String pair = priceDTO.getPair();
        List<PriceDTO> history = priceHistory.computeIfAbsent(pair, k -> new ArrayList<>());
        synchronized (history){
            history.add(priceDTO);
            if(history.size() > 24){
                history.removeFirst();
            }
        }

//        this.latestPrice = priceDTO;
    }

    public List<PriceDTO> getPriceHistory(String pair) {
        return priceHistory.getOrDefault(pair, new ArrayList<>());
    }

    public PriceDTO getLatestPrice(String pair){
        List<PriceDTO> history = priceHistory.get(pair);
        if (history != null && !history.isEmpty()){
            return history.getLast();
        }

        return null;
    }
}
