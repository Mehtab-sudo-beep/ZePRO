package com.zepro.config;

import com.zepro.security.JwtFilter;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // ✅ PUBLIC APIs
                        .requestMatchers("/auth/**").permitAll()

                        // 🔥 ALLOW INSTITUTE + DEPARTMENT ENDPOINTS (no auth needed)
                        .requestMatchers("/admin/institute", "/admin/institutes").permitAll()
                        .requestMatchers("/admin/department", "/admin/department/**", "/admin/departments/**").permitAll()

                        // admin APIs (protected)
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // faculty APIs
                        .requestMatchers("/faculty/**").hasAnyRole("FACULTY", "FACULTY_COORDINATOR")

                        // coordinator APIs
                        .requestMatchers("/coordinator/**").hasRole("FACULTY_COORDINATOR")

                        // student APIs
                        .requestMatchers("/student/**").hasRole("STUDENT")

                        // project viewing
                        .requestMatchers("/projects/**").hasAnyRole("STUDENT", "FACULTY", "ADMIN")

                        // everything else requires login
                        .anyRequest().authenticated())

                // ✅ JWT filter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}