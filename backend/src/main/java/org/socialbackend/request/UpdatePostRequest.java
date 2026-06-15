package org.socialbackend.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request object for creating and updating posts.
 *
 * @author Kacper Kurek
 * @version 1.0
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdatePostRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String content;
    private String newImgUrl;
    private String newImgId;
    @JsonProperty("isImageDeleted")
    private boolean isImageDeleted;
}
