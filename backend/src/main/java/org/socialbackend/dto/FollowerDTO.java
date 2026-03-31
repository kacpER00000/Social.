package org.socialbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for followers.
 * This class is used to transfer follower data between the server and the client.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
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
