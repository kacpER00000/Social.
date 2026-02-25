package org.socialbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FollowStatus {
    private boolean isFollowing;
    private boolean isFollowingBy;
    private LocalDateTime followedSince;
    private Long followersCount;
}
