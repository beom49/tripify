package com.tripify.tripify;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/health")
    public String health() {
        return "Tripify 서버 정상 작동!";
    }
}
