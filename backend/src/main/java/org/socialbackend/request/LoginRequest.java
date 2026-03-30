package org.socialbackend.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request object for user login.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest{
    @NotBlank
    String email;
    @NotBlank
    String password;
}
