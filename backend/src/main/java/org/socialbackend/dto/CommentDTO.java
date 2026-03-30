package org.socialbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for comments.
 * This class is used to transfer comment data between the server and the client.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentDTO {
    private Long commentId;
    private Long postId;
    private Long authorId;
    private String author;
    private String content;
    private LocalDateTime createdAt;
    private boolean canEdit;
    private boolean canDelete;
    private boolean isAuthorFollowed;
}
