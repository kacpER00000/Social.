package org.socialbackend.service;

import lombok.RequiredArgsConstructor;
import org.socialbackend.details.AppUserDetails;
import org.socialbackend.model.UserLoginData;
import org.socialbackend.repository.UserLoginDataRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Service class for loading user-specific data.
 * This class implements the UserDetailsService interface to provide user details to Spring Security.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserLoginDataRepository userLoginDataRepository;

    /**
     * Loads the user's data by their email address.
     *
     * @param email The email address of the user.
     * @return The UserDetails object containing the user's information.
     * @throws UsernameNotFoundException if a user with the provided email does not exist in the database.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserLoginData userLoginData = userLoginDataRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User with this email don't exist"));
        return new AppUserDetails(userLoginData);
    }
}