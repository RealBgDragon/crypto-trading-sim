package com.trading212.backend.dto;

public class PriceDTO {
    private String pair;
    private double price;

    public PriceDTO(String pair, double price){
        this.pair = pair;
        this.price = price;
    }

    public String getPair(){
        return pair;
    }

    public void setPair(String pair){
        this.pair = pair;
    }

    public double getPrice(){
        return price;
    }

    public void setPrice(double price){
        this.price = price;
    }

}
