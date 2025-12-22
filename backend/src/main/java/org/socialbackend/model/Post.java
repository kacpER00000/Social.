package org.socialbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="post", schema="social")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="post_id")
    private Long postId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id")
    @JsonIgnore
    private User user;
    @Column(name="title")
    private String title;
    @Column(name="content")
    private String content;
    @Column(name="created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
    @OneToMany(mappedBy = "post")
    private List<Comment> comments = new ArrayList<>();
    @Column(name="likes_count")
    private Long likesCount=0L;

    public Long getLikesCount() {
        return likesCount;
    }
    public void setLikesCount(Long likesCount) {
        this.likesCount = likesCount;
    }

    public Post(){}

    public Post(User user, String title, String content) {
        this.user = user;
        this.title = title;
        this.content = content;
    }

    public Long getPostId() {
        return postId;
    }

    public User getUser() {
        return user;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setUser(User u){
        this.user=u;
    }

    public void addComment(Comment comment){
        comments.add(comment);
        comment.setPost(this);
    }
    public void removeComment(Comment comment){
        comments.remove(comment);
        comment.setPost(this);
    }
}
