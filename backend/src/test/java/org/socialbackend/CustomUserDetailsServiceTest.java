package org.socialbackend;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.socialbackend.model.UserLoginData;
import org.socialbackend.repository.UserLoginDataRepository;
import org.socialbackend.service.CustomUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CustomUserDetailsServiceTest {
    @Mock
    private UserLoginDataRepository userLoginDataRepository;
    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void shouldSuccessfullyReturnUserDetails(){
        String email="test@example.pl";
        String password="password";
        UserLoginData userLoginDataFromDb = new UserLoginData(null, email, password);
        when(userLoginDataRepository.findByEmail(email)).thenReturn(Optional.of(userLoginDataFromDb));
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
        assertEquals(email, userDetails.getUsername());
        assertEquals(password, userDetails.getPassword());
    }

    @Test
    void shouldUnsuccessfullyReturnUserDetails(){
        String email="test@example.pl";
        when(userLoginDataRepository.findByEmail(email)).thenReturn(Optional.empty());
        assertThrows(UsernameNotFoundException.class, () -> customUserDetailsService.loadUserByUsername(email));
    }
}
