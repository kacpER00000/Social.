package org.socialbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for posts.
 * This class is used to transfer post data between the server and the client.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostDTO {
    private Long postId;
    private Long authorId;
    private String author;
    private String title;
    private String content;
    private String imgUrl;
    private String imgId;
    private LocalDateTime createdAt;
    private Long likesNum;
    private Long commentCount;
    private Boolean isLiked;
    private Boolean isAuthorFollowed;
    private boolean canEdit;
}
