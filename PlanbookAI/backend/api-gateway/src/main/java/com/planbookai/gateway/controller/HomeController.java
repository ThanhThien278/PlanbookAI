package com.planbookai.gateway.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class HomeController {

    @GetMapping("/")
    public Mono<String> home() {
        return Mono.just("PlanbookAI API Gateway is running on port 8000");
    }
}
