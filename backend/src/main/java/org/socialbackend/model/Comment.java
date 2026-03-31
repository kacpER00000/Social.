package org.socialbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Represents a comment on a post in the social database.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Entity
@Table(name="comment", schema="social")
@NoArgsConstructor
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="comment_id")
    @Getter
    @Setter
    private Long commentId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="post_id")
    @JsonIgnore
    @Getter
    @Setter
    private Post post;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id")
    @JsonIgnore
    @Getter
    @Setter
    private User user;
    @Column(name="content")
    @Getter
    @Setter
    private String content;
    @Column(name="created_at")
    @CreationTimestamp
    @Getter
    @Setter
    private LocalDateTime createdAt;

    public Comment(Post post, User user, String content) {
        this.post = post;
        this.user = user;
        this.content = content;
    }

}
