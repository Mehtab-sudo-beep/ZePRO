package com.zepro.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;

import org.springframework.stereotype.Component;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtFilter(JwtUtil jwtUtil,
            CustomUserDetailsService userDetailsService) {

        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        System.out.println("[JwtFilter] Incoming request: " + path);

        // ✅ Skip authentication for public endpoints
        if (path.startsWith("/auth") || path.startsWith("/admin/institute") || path.startsWith("/admin/department")) {
            System.out.println("[JwtFilter] Skipping JWT for: " + path);
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");

        System.out.println("[JwtFilter] Authorization header: " + header);

        if (header != null && header.startsWith("Bearer ")) {

            String token = header.substring(7);
            System.out.println("[JwtFilter] Token extracted");

            try {
                String email = jwtUtil.extractEmail(token);
                System.out.println("[JwtFilter] Email: " + email);

                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (jwtUtil.validateToken(token, email)) {

                    System.out.println("[JwtFilter] Token valid ✅");

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    System.out.println("[JwtFilter] Token invalid ❌");
                }

            } catch (Exception e) {
                System.out.println("[JwtFilter] ERROR parsing token ❌");
                e.printStackTrace();
            }
        } else {
            System.out.println("[JwtFilter] No valid Authorization header");
        }

        filterChain.doFilter(request, response);
    }
}