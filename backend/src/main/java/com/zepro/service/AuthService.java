package com.zepro.service;

import org.springframework.stereotype.Service;

@Service
public class AuthService {

    public String login(String email, String password){
        return "Login Success";
    }

}