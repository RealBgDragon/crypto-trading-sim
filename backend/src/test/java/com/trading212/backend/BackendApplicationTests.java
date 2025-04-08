package com.trading212.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
class BackendApplicationTests {

//    @GetMapping("/api/hello")
//    public String hello() {
//        System.out.println("Hello World");
//        return "Hello World";
//    }

}
