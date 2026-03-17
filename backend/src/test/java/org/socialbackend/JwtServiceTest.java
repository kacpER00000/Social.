package org.socialbackend;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.socialbackend.details.AppUserDetails;
import org.socialbackend.model.UserLoginData;
import org.socialbackend.service.JwtService;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.*;

public class JwtServiceTest {
    private JwtService jwtService;

    @BeforeEach
    void setUp(){
        jwtService = new JwtService();
        String mockSecretKey = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
        ReflectionTestUtils.setField(jwtService,"secretKey",mockSecretKey);
        ReflectionTestUtils.setField(jwtService,"expiration",1000*60*60*24L);
    }

    @Test
    void shouldGenerateTokenAndExtractUsername(){
        String email="test@example.com";
        UserLoginData userLoginData = new UserLoginData(null,email,"password");
        AppUserDetails userDetails = new AppUserDetails(userLoginData);
        String jwtToken = jwtService.generateToken(new HashMap<>(), userDetails);
        String username = jwtService.extractUsername(jwtToken);
        assertNotNull(jwtToken);
        assertEquals(email,username);
    }

    @Test
    void shouldValidateTokenCorrectly(){
        String email="test@example.com";
        UserLoginData userLoginData = new UserLoginData(null,email,"password");
        AppUserDetails userDetails = new AppUserDetails(userLoginData);
        String jwtToken = jwtService.generateToken(new HashMap<>(), userDetails);
        assertTrue(jwtService.isTokenValid(jwtToken, userDetails));
    }

    @Test
    void shouldNotValidateTokenCorrectlyForDifferentUser(){
        String email1="test1@example.com";
        String email2="test2@example.com";
        String password="password";
        UserLoginData userLoginData1 = new UserLoginData(null,email1,password);
        UserLoginData userLoginData2 = new UserLoginData(null,email2,password);
        AppUserDetails userDetails1 = new AppUserDetails(userLoginData1);
        AppUserDetails userDetails2 = new AppUserDetails(userLoginData2);
        String jwtToken1 = jwtService.generateToken(new HashMap<>(), userDetails1);
        String jwtToken2 = jwtService.generateToken(new HashMap<>(), userDetails2);
        assertFalse(jwtService.isTokenValid(jwtToken1,userDetails2));
        assertFalse(jwtService.isTokenValid(jwtToken2,userDetails1));
    }
}
