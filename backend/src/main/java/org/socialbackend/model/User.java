package org.socialbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;

import java.util.List;

@Entity
@Table(name="user", schema = "social")
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="user_id")
    @Getter
    @Setter
    private Long userId;
    @Column(name="first_name")
    @Getter
    @Setter
    private String firstName;
    @Column(name="last_name")
    @Getter
    @Setter
    private String lastName;
    @Column(name="birth_date")
    @Getter
    @Setter
    private LocalDate birthDate;
    @Column(name="sex")
    @Getter
    @Setter
    private Character sex;
    @OneToMany(mappedBy = "followed")
    @JsonIgnore
    private List<Follower> followers = new ArrayList<>();
    @OneToMany(mappedBy = "follower")
    @JsonIgnore
    @Getter
    @Setter
    private List<Follower> following = new ArrayList<>();
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private UserLoginData userLoginData;
    @OneToMany(mappedBy = "user")
    @JsonIgnore
    @Getter
    @Setter
    private List<Post> posts = new ArrayList<>();
    @Column(name = "followers_count")
    @Getter
    private Long followersCount = 0L;
    @Column(name = "following_count")
    @Getter
    private Long followingCount = 0L;

    public User(String firstName, String lastName, LocalDate birthDate, Character sex, UserLoginData userLoginData) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDate = birthDate;
        this.sex = sex;
        this.userLoginData = userLoginData;
    }

    public void setUserLoginData(UserLoginData userLoginData) {
        this.userLoginData = userLoginData;
        if(this.userLoginData != null){
            this.userLoginData.setUser(this);
        }
    }

    public void follow(Follower user){
        following.add(user);
        user.setFollower(this);
    }
    public void unfollow(Follower user){
        following.remove(user);
        user.setFollower(null);
    }
    public void addFollower(Follower user){
        followers.add(user);
        user.setFollowed(this);
    }
    public void removeFollower(Follower user){
        followers.remove(user);
        user.setFollowed(null);
    }
    public void addPost(Post post){
        this.posts.add(post);
        post.setUser(this);
    }
    public void removePost(Post postToDelete){
        this.posts.remove(postToDelete);
        postToDelete.setUser(null);
    }
}
