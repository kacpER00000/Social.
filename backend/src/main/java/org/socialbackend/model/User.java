package org.socialbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name="user", schema = "social")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="user_id")
    private Long userId;
    @Column(name="first_name")
    private String firstName;
    @Column(name="last_name")
    private String lastName;
    @Column(name="birth_date")
    private LocalDate birthDate;
    @Column(name="sex")
    private Character sex;
    @OneToMany(mappedBy = "followed")
    @JsonIgnore
    private List<Follower> followers = new ArrayList<>();
    @OneToMany(mappedBy = "follower")
    @JsonIgnore
    private List<Follower> following = new ArrayList<>();
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private UserLoginData userLoginData;
    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Post> posts = new ArrayList<>();

    public User(){}

    public User(String firstName, String lastName, LocalDate birthDate, Character sex, UserLoginData userLoginData) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDate = birthDate;
        this.sex = sex;
        this.userLoginData = userLoginData;
    }

    public Long getUserId() {
        return userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public Character getSex() {
        return sex;
    }

    public List<Follower> getFollowers() {
        return followers;
    }

    public List<Follower> getFollowing() {
        return following;
    }

    public UserLoginData getUserLoginData() {
        return userLoginData;
    }

    public List<Post> getPosts() {
        return posts;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public void setSex(Character sex) {
        this.sex = sex;
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
