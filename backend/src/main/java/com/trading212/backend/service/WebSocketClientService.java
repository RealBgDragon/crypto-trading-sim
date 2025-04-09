package com.trading212.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trading212.backend.dto.PriceDTO;
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

    private static final String KRAKEN_WS_URL = "wss://ws.kraken.com";

    private WebSocketClient webSocketClient;

    @Autowired
    private PriceService priceService;

    public void connectToKraken() {

        List<String> pairs = Arrays.asList(
                "XBT/USD", "ETH/USD", "USDT/USD", "TRX/USD", "SOL/USD",
                "XRP/USD", "USDC/USD", "ADA/USD", "AVAX/USD", "DOGE/USD",
                "DOT/USD", "SHIB/USD", "MATIC/USD", "DAI/USD", "LTC/USD",
                "LINK/USD", "ATOM/USD", "XLM/USD", "UNI/USD", "XMR/USD"
        );

        try{
            System.out.println("here");
            webSocketClient = new WebSocketClient(new URI(KRAKEN_WS_URL), new Draft_6455()) {
                @Override
                public void onOpen(ServerHandshake serverHandshake) {
                    System.out.println("WebSocket connected: " + serverHandshake.getHttpStatusMessage());
                    for (String pair : pairs) {
                        subscribeToTicker(pair);
                    }
                }

                @Override
                public void onMessage(String message) {
//                    System.out.println("Received message: " + message);

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
                            System.out.println(price);
                            //TODO decide if needed
                            priceService.updatePrice(priceDTO);  // A service to store/update the latest price so I can add a graph
                        }

                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                }

                @Override
                public void onClose(int i, String s, boolean b) {
                    System.out.println("WebSocet closed: " + s);
                }

                @Override
                public void onError(Exception e) {
                    throw new RuntimeException(e);
                }
            };

            webSocketClient.connect();
        }catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void subscribeToTicker(String pair) {
        String subscriptionMessage = String.format("{\"event\": \"subscribe\", \"pair\": [\"%s\"], \"subscription\": {\"name\": \"ticker\"}}", pair);
        webSocketClient.send(subscriptionMessage); // Send the subscription message to Kraken
    }

    public void closeConnection() {
        if (webSocketClient != null && webSocketClient.isOpen()) {
            webSocketClient.close();
        }
    }

}
