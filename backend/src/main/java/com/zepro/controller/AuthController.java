package com.zepro.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    @GetMapping("/hello")
    public String hello(){
        return "Backend Working";
    }

}