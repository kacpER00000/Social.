package org.socialbackend.request;

import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request object for creating and updating comments.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentRequest {
    @NotBlank
    private String content;
}
