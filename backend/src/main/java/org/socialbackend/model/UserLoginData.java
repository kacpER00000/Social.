package org.socialbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents the login data for a user in the social database.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Entity
@Table(name="user_login_data",schema="social")
@NoArgsConstructor
public class UserLoginData {
    @Id
    @Column(name="user_id")
    @Getter
    private Long userId;
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonIgnore
    @Getter
    @Setter
    private User user;
    @Column(name="email")
    @Getter
    @Setter
    private String email;
    @Column(name="password")
    @Getter
    @Setter
    private String password;

    public UserLoginData(User user, String email, String password) {
        this.user = user;
        this.email = email;
        this.password = password;
    }
}
