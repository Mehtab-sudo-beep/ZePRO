package com.zepro.config;

import com.zepro.security.JwtFilter;
import com.zepro.security.CustomUserDetailsService;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter){
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth

                // public APIs
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/api/domains/**").permitAll()
            .requestMatchers("/api/subdomains/**").permitAll()

                // admin APIs
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // faculty APIs
                .requestMatchers("/faculty/**").hasAnyRole("FACULTY","FACULTY_COORDINATOR")

                // coordinator APIs
                .requestMatchers("/coordinator/**").hasRole("FACULTY_COORDINATOR")

                // student APIs
                .requestMatchers("/teams/**").hasRole("STUDENT")
                .requestMatchers("/requests/**").hasRole("STUDENT")

                // project viewing allowed for all logged users
                .requestMatchers("/projects/**").hasAnyRole("STUDENT","FACULTY","ADMIN")

                // everything else requires login
                .anyRequest().authenticated()
            )

            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}