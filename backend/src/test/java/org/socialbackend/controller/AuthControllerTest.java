package org.socialbackend.controller;

import org.junit.jupiter.api.Test;
import org.socialbackend.details.AppUserDetails;
import org.socialbackend.dto.UserDTO;
import org.socialbackend.request.LoginRequest;
import org.socialbackend.request.RegisterUserRequest;
import org.socialbackend.service.CustomUserDetailsService;
import org.socialbackend.service.JwtService;
import org.socialbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.Collections;


import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void shouldLoginSuccessfully() throws Exception {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "password");
        AppUserDetails mockUserDetails = mock(AppUserDetails.class);
        when(mockUserDetails.getUserId()).thenReturn(1L);
        when(mockUserDetails.getUsername()).thenReturn("test@example.com");
        Authentication authentication = new UsernamePasswordAuthenticationToken(mockUserDetails, null, Collections.emptyList());
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        UserDTO userDTO = new UserDTO();
        userDTO.setUserId(1L);
        userDTO.setFirstName("Test");
        userDTO.setLastName("User");
        when(userService.findUserById(1L, 1L)).thenReturn(userDTO);
        String fakeToken = "fake.jwt.token";
        when(jwtService.generateToken(any(), eq(mockUserDetails))).thenReturn(fakeToken);
        mockMvc.perform(post("/social/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(fakeToken));
    }

    @Test
    void shouldRegisterUserSuccessfully() throws Exception {
        RegisterUserRequest registerRequest = new RegisterUserRequest(
                "New",
                "User",
                LocalDate.of(1990, 1, 1),
                'M',
                "newuser@example.com",
                "password123"
        );
        mockMvc.perform(post("/social/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());
        verify(userService, times(1)).addUser(any(RegisterUserRequest.class));
    }

    @Test
    void shouldFailRegistrationWithInvalidData() throws Exception {
        RegisterUserRequest registerRequest = new RegisterUserRequest(
                "New",
                "User",
                LocalDate.now().plusDays(1),
                'X',
                "newuser@example.com",
                ""
        );
        mockMvc.perform(post("/social/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());
        verify(userService, never()).addUser(any(RegisterUserRequest.class));
    }
}
