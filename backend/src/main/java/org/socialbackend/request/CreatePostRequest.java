package org.socialbackend.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request object for creating posts.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreatePostRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String content;
    private String imgUrl;
    private String imgId;
}
