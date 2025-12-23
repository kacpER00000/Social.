package org.socialbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostDTO {
    private Long postId;
    private String author;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private Long likesNum;
    private Long commentCount;
}
