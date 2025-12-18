package org.socialbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name="follower",schema="social")
public class Follower {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="follower_id")
    @JsonIgnore
    private User follower;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="followed_id")
    @JsonIgnore
    private User followed;
    @Column(name="start_follow_date")
    @CreationTimestamp
    private LocalDateTime startFollowDate;

    public Follower(){}
    public Follower(User follower, User followed) {
        this.follower = follower;
        this.followed = followed;
    }

    public Long getId() {
        return id;
    }

    public User getFollower() {
        return follower;
    }

    public User getFollowed() {
        return followed;
    }

    public LocalDateTime getStartFollowDate() {
        return startFollowDate;
    }

    public void setFollower(User follower) {
        this.follower = follower;
    }

    public void setFollowed(User followed) {
        this.followed = followed;
    }
}
