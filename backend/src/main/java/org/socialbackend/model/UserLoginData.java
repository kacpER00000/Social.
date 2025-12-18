package org.socialbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name="user_login_data",schema="social")
public class UserLoginData {
    @Id
    @Column(name="user_id")
    private Long userId;
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
    @Column(name="email")
    private String email;
    @Column(name="password")
    private String password;
    public UserLoginData(){}

    public UserLoginData(User user, String email, String password) {
        this.user = user;
        this.email = email;
        this.password = password;
    }

    public Long getUserId() {
        return userId;
    }

    public User getUser() {
        return user;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
