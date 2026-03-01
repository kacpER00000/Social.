package org.socialbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FollowerDTO {
    private Long userId;
    private String followerUsername;
    private LocalDateTime followedSince;
    private boolean isFollowing;
    private boolean isFollowingBy;
    private Long followersCount;
}
