package org.socialbackend;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.socialbackend.config.JwtAuthenticationFilter;
import org.socialbackend.service.CustomUserDetailsService;
import org.socialbackend.service.JwtService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class JwtAuthenticationFilterTest {
    @Mock
    private JwtService jwtService;
    @Mock
    private CustomUserDetailsService customUserDetailsService;
    @Mock
    private HttpServletRequest request;
    @Mock
    private HttpServletResponse response;
    @Mock
    private FilterChain filterChain;
    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @AfterEach
    void tearDown(){
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldContinueFilterChainIfNoAuthHeader() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn(null);
        jwtAuthenticationFilter.doFilter(request,response,filterChain);
        verify(filterChain,times(1)).doFilter(request,response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void shouldAuthenticateUserIfTokenValid() throws ServletException, IOException {
        String token = "valid_token";
        String userEmail = "test@example.com";
        UserDetails mockUserDetails = mock(UserDetails.class);
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtService.extractUsername(token)).thenReturn(userEmail);
        when(customUserDetailsService.loadUserByUsername(userEmail)).thenReturn(mockUserDetails);
        when(jwtService.isTokenValid(token, mockUserDetails)).thenReturn(true);
        jwtAuthenticationFilter.doFilter(request,response,filterChain);
        verify(filterChain,times(1)).doFilter(request,response);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(mockUserDetails, SecurityContextHolder.getContext().getAuthentication().getPrincipal());
    }
}
