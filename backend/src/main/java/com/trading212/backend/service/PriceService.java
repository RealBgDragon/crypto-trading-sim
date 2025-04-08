package com.trading212.backend.service;

import com.trading212.backend.dto.PriceDTO;
import org.springframework.stereotype.Service;

@Service
public class PriceService {
    private PriceDTO latestPrice;

    public void updatePrice(PriceDTO priceDTO){
        this.latestPrice = priceDTO;
    }

    public PriceDTO getLatestPrice(){
        return latestPrice;
    }
}
