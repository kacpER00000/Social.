package org.socialbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;


import java.time.LocalDateTime;

@Entity
@Table(name="follower",schema="social")
@NoArgsConstructor
public class Follower {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    @Getter
    @Setter
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="follower_id")
    @JsonIgnore
    @Getter
    @Setter
    private User follower;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="followed_id")
    @JsonIgnore
    @Getter
    @Setter
    private User followed;
    @Column(name="start_follow_date")
    @CreationTimestamp
    @Getter
    @Setter
    private LocalDateTime startFollowDate;

    public Follower(User follower, User followed) {
        this.follower = follower;
        this.followed = followed;
    }

}
