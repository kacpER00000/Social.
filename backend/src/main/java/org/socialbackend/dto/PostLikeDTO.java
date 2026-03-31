package org.socialbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for post likes.
 * This class is used to transfer post like data between the server and the client.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostLikeDTO {
    private String username;
    private Long userId;
    private Long postId;
    private LocalDateTime likedAt;
}
