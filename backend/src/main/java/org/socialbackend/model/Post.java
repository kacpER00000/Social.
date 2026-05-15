package org.socialbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a post in the social database.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Entity
@Table(name = "post", schema = "social")
@NoArgsConstructor
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    @Getter
    @Setter
    private Long postId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    @Getter
    @Setter
    private User user;
    @Column(name = "title")
    @Getter
    @Setter
    private String title;
    @Column(name = "content")
    @Getter
    @Setter
    private String content;
    @Column(name = "created_at")
    @CreationTimestamp
    @Getter
    private LocalDateTime createdAt;
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();
    @Column(name = "likes_count")
    @Getter
    private Long likesCount = 0L;
    @Column(name = "comment_count")
    @Getter
    private Long commentCount = 0L;
    @Column(name = "img_url")
    @Setter
    @Getter
    private String imgUrl;
    @Column(name = "img_id")
    @Setter
    @Getter
    private String imgId;

    public Post(User user, String title, String content, String imgUrl) {
        this.user = user;
        this.title = title;
        this.content = content;
        this.imgUrl = imgUrl;
    }

    public void addComment(Comment comment) {
        comments.add(comment);
        comment.setPost(this);
    }

    public void removeComment(Comment comment) {
        comments.remove(comment);
        comment.setPost(this);
    }
}
