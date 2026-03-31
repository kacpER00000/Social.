package org.socialbackend.details;

import org.jspecify.annotations.Nullable;
import org.socialbackend.model.UserLoginData;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Custom UserDetails implementation for the application.
 * This class wraps the UserLoginData object to provide user details to Spring Security.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
public class AppUserDetails implements UserDetails {
    private UserLoginData userLoginData;

    public AppUserDetails(UserLoginData userLoginData) {
        this.userLoginData = userLoginData;
    }

    public Long getUserId(){return userLoginData.getUserId();}

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public @Nullable String getPassword() {
        return userLoginData.getPassword();
    }

    @Override
    public String getUsername() {
        return userLoginData.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
