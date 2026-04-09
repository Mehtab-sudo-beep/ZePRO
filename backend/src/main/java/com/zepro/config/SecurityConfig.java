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

                // ✅ PUBLIC APIs
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/api/domains/**").permitAll()
                .requestMatchers("/api/subdomains/**").permitAll()
                
                // ✅ PUBLIC INSTITUTE & DEPARTMENT ENDPOINTS (for profile completion)
                .requestMatchers("/student/institutes").permitAll()
                .requestMatchers("/student/departments/**").permitAll()
                .requestMatchers("/faculty/institutes").permitAll()
                .requestMatchers("/faculty/departments/**").permitAll()

                // ✅ ADMIN APIs
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // ✅ FACULTY APIs (profile status & complete require auth)
                .requestMatchers("/faculty/profile-status/**").hasRole("FACULTY")
                .requestMatchers("/faculty/complete-profile/**").hasRole("FACULTY")
                .requestMatchers("/faculty/**").hasRole("FACULTY")

                // ✅ COORDINATOR APIs
                .requestMatchers("/coordinator/**").hasRole("FACULTY")

                // ✅ STUDENT APIs (profile status & complete require auth)
                .requestMatchers("/student/profile-status/**").hasRole("STUDENT")
                .requestMatchers("/student/complete-profile/**").hasRole("STUDENT")
                .requestMatchers("/student/**").hasRole("STUDENT")

                // ✅ PROJECT viewing allowed for all logged users
                .requestMatchers("/projects/**").hasAnyRole("STUDENT","FACULTY","ADMIN")

                // ✅ Everything else requires login
                .anyRequest().authenticated()
            )

            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}