package com.zepro.config;

import com.zepro.security.JwtFilter;
import com.zepro.security.CustomUserDetailsService;

import org.springframework.context.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CustomUserDetailsService userDetailsService; // ← ADD

    public SecurityConfig(JwtFilter jwtFilter,
            CustomUserDetailsService userDetailsService) { // ← ADD
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService; // ← ADD
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ← ADD THIS BEAN
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // ← ADD THIS BEAN
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // ── PUBLIC ──────────────────────────────────────────────
                        .requestMatchers("/auth/**").permitAll()

                        // ── ADMIN ───────────────────────────────────────────────
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // ── FACULTY COORDINATOR ─────────────────────────────────
                        .requestMatchers("/api/coordinator/**").hasRole("FACULTY_COORDINATOR")

                        // ── FACULTY ─────────────────────────────────────────────
                        .requestMatchers("/faculty/**").hasAnyRole("FACULTY", "FACULTY_COORDINATOR")

                        // ── STUDENT ─────────────────────────────────────────────
                        .requestMatchers("/student/**").hasRole("STUDENT")
                        .requestMatchers("/api/teams/**").hasRole("STUDENT")
                        .requestMatchers("/api/requests/**").hasRole("STUDENT")

                        // ── SHARED ──────────────────────────────────────────────
                        .requestMatchers("/api/projects/**")
                        .hasAnyRole("STUDENT", "FACULTY", "ADMIN")

                        // ── EVERYTHING ELSE NEEDS LOGIN ─────────────────────────
                        .anyRequest().authenticated())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authenticationProvider(authenticationProvider()) // ← ADD
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}