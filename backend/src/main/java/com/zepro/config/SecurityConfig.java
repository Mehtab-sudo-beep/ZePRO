package com.zepro.config;

import com.zepro.security.JwtFilter;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.*;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter){
        this.jwtFilter = jwtFilter;
    }

    // ✅ Password Encoder
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    // ✅ CORS Configuration
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // IMPORTANT: use allowedOriginPatterns when allowCredentials = true
        config.setAllowedOriginPatterns(List.of(
                "*"
        ));

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    // ✅ Security Filter Chain
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth

                // ✅ PUBLIC APIs
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()

                // ✅ PUBLIC INSTITUTE & DEPARTMENT ENDPOINTS
                .requestMatchers("/student/institutes").permitAll()
                .requestMatchers("/student/departments/**").permitAll()
                .requestMatchers("/faculty/institutes").permitAll()
                .requestMatchers("/faculty/departments/**").permitAll()

                // ✅ ADMIN APIs
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // ✅ FACULTY APIs
                .requestMatchers("/faculty/profile-status/**").hasRole("FACULTY")
                .requestMatchers("/faculty/complete-profile/**").hasRole("FACULTY")
                .requestMatchers("/faculty/**").hasRole("FACULTY")

                // ✅ COORDINATOR APIs
                .requestMatchers("/coordinator/**").hasRole("FACULTY")

                // ✅ STUDENT APIs
                .requestMatchers("/student/profile-status/**").hasRole("STUDENT")
                .requestMatchers("/student/complete-profile/**").hasRole("STUDENT")
                .requestMatchers("/student/**").hasRole("STUDENT")

                // ✅ PROJECT APIs
                .requestMatchers("/projects/**").hasAnyRole("STUDENT","FACULTY","ADMIN")

                // ✅ EVERYTHING ELSE
                .anyRequest().authenticated()
            )

            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}