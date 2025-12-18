package org.socialbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FollowerDTO {
    private Long id;
    private Long followerId;
    private String followerUsername;
    private LocalDateTime startFollowDate;
}
