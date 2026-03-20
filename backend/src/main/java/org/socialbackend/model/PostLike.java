package org.socialbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name="post_like",schema="social")
@NoArgsConstructor
public class PostLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    @Getter
    private Long id;
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
    @Column(name="liked_at")
    @CreationTimestamp
    @Getter
    private LocalDateTime likedAt;

    public PostLike(Post post, User user) {
        this.post = post;
        this.user = user;
    }

}
