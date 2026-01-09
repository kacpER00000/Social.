package org.socialbackend.controller;

import lombok.RequiredArgsConstructor;
import org.socialbackend.dto.AuthDTO;
import org.socialbackend.dto.UserDTO;
import org.socialbackend.model.User;
import org.socialbackend.repository.UserLoginDataRepository;
import org.socialbackend.request.LoginRequest;
import org.socialbackend.service.JwtService;
import org.socialbackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/social/auth")
@RequiredArgsConstructor
public class LoginController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    @PostMapping("/login")
    public ResponseEntity<AuthDTO> login(@RequestBody LoginRequest loginRequest){
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.email(),
                        loginRequest.password()
                )
        );
        var userDetails = (UserDetails) authentication.getPrincipal();
        UserDTO user = userService.findUserByEmail(userDetails.getUsername());
        Map<String,Object> claims = new HashMap<>();
        claims.put("username", user.getFirstName() + " " + user.getLastName());
        claims.put("userId", user.getUserId());
        String token = jwtService.generateToken(claims, userDetails);
        return ResponseEntity.ok(new AuthDTO(token));
    }
}
