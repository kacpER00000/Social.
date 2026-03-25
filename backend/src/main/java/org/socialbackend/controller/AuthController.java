package org.socialbackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.socialbackend.details.AppUserDetails;
import org.socialbackend.dto.AuthDTO;
import org.socialbackend.dto.UserDTO;


import org.socialbackend.request.LoginRequest;
import org.socialbackend.request.RegisterUserRequest;
import org.socialbackend.service.JwtService;
import org.socialbackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;


import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/social/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    @PostMapping("/login")
    public ResponseEntity<AuthDTO> login(@RequestBody LoginRequest loginRequest){
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );
        var userDetails = (AppUserDetails) authentication.getPrincipal();
        UserDTO user = userService.findUserById(userDetails.getUserId(), userDetails.getUserId());
        Map<String,Object> claims = new HashMap<>();
        claims.put("username", user.getFirstName() + " " + user.getLastName());
        claims.put("userId", user.getUserId());
        String token = jwtService.generateToken(claims, userDetails);
        return ResponseEntity.ok(new AuthDTO(token));
    }
    @PostMapping("/register")
    public ResponseEntity<Void> registerUser(@Valid @RequestBody RegisterUserRequest registerUserRequest){
        userService.addUser(registerUserRequest);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
