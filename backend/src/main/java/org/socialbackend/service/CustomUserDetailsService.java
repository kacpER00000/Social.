package org.socialbackend.service;

import lombok.RequiredArgsConstructor;
import org.socialbackend.details.AppUserDetails;
import org.socialbackend.model.UserLoginData;
import org.socialbackend.repository.UserLoginDataRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserLoginDataRepository userLoginDataRepository;
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserLoginData userLoginData = userLoginDataRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User with this email don't exist"));
        return new AppUserDetails(userLoginData);
    }
}
