package org.socialbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostLikeDTO {
    private String username;
    private Long userId;
    private Long postId;
    private LocalDateTime likedAt;
}
