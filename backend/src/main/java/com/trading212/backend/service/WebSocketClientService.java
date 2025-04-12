package com.trading212.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trading212.backend.dto.PriceDTO;
import jakarta.annotation.PostConstruct;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft_6455;
import org.java_websocket.handshake.ServerHandshake;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.management.RuntimeErrorException;
import java.net.URI;
import java.util.Arrays;
import java.util.List;

@Service
public class WebSocketClientService {

    private static final String KRAKEN_WS_URL = "wss://ws.kraken.com/";   //TODO if causes problems its cuz v2

    private WebSocketClient webSocketClient;
    private boolean isConnecting = false;
    private boolean isConnected = false;

    @Autowired
    private PriceService priceService;

    @PostConstruct
    public void init() {
        System.out.println("WebSocketClientService initialized - connecting to Kraken...");
        connectToKraken();
    }

    public boolean isConnected() {
        return isConnected && webSocketClient != null && webSocketClient.isOpen();
    }

    public void connectToKraken() {

        if (isConnecting) {
            return;
        }

        List<String> pairs = Arrays.asList(
                "XBT/USD", "ETH/USD", "USDT/USD", "TRX/USD", "SOL/USD",
                "XRP/USD", "USDC/USD", "ADA/USD", "AVAX/USD", "AKT/USD",
                "DOT/USD", "SHIB/USD", "MATIC/USD", "DAI/USD", "LTC/USD",
                "LINK/USD", "ATOM/USD", "XLM/USD", "UNI/USD", "XMR/USD"
        );

        try{
            webSocketClient = new WebSocketClient(new URI(KRAKEN_WS_URL), new Draft_6455()) {
                @Override
                public void onOpen(ServerHandshake serverHandshake) {
                    System.out.println("WebSocket connected: " + serverHandshake.getHttpStatusMessage());

                    isConnected = true;
                    isConnecting = false;

                    for (String pair : pairs) {
                        subscribeToTicker(pair);
                    }
                }

                @Override
                public void onMessage(String message) {

                    // Formating the message so I only get the price
                    try{
                        ObjectMapper objectMapper = new ObjectMapper();
                        JsonNode rootNode = objectMapper.readTree(message);
                        // if the node has event than it's probably a heartbeat
                        if (!rootNode.has("event")){
                            // gets the second element, then gets c (Last trade closed) and the first element (price)
                            JsonNode price = rootNode.get(1).get("c").get(0);
                            JsonNode pair = rootNode.get(3); // that's the pair

                            PriceDTO priceDTO = new PriceDTO(pair.asText(), price.asDouble());
                            priceService.updatePrice(priceDTO);  // A service to store/update the latest price so I can add a graph
                        }

                    } catch (Exception e) {
                        System.err.println("Error processing message: " + e.getMessage());
                    }
                }

                @Override
                public void onClose(int i, String s, boolean b) {
                    System.out.println("WebSocet closed: " + s);
                    isConnected = false;
                    isConnecting = false;

                    if (b) {
                        System.out.println("Reconnecting in 5 seconds...");
                        try {
                            Thread.sleep(5000);
                            connectToKraken();
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                    }
                }

                @Override
                public void onError(Exception e) {
                    System.err.println("WebSocket error: " + e.getMessage());
                    isConnecting = false;
                }
            };

            webSocketClient.connect();
        }catch (Exception e) {
            isConnecting = false;
            System.err.println("Error initializing WebSocket: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public void subscribeToTicker(String pair) {
        if (webSocketClient != null && webSocketClient.isOpen()) {
            String subscribeMessage = "{ \"event\": \"subscribe\", \"pair\": [\"" + pair + "\"], \"subscription\": {\"name\": \"ticker\"}}";
            webSocketClient.send(subscribeMessage);
            System.out.println("Subscribed to " + pair);
        } else {
            System.out.println("WebSocket not open yet, can't subscribe to " + pair);
        }
    }


    public void closeConnection() {
        if (webSocketClient != null && webSocketClient.isOpen()) {
            webSocketClient.close();
            isConnected = false;
        }

    }

}
