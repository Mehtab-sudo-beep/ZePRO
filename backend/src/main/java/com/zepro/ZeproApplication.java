package com.zepro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication
public class ZeproApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZeproApplication.class, args);
    }

}