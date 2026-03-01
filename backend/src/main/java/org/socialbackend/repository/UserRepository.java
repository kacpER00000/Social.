package org.socialbackend.repository;

import org.socialbackend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u WHERE u.firstName LIKE %:query% OR u.lastName LIKE %:query%")
    Page<User> searchByFirstNameOrLastName(@Param("query") String query, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.firstName LIKE %:firstName% AND u.lastName LIKE %:lastName%")
    Page<User> searchByFirstNameAndLastName(@Param("firstName") String firstName, @Param("lastName") String lastName,
            Pageable pageable);

    @Modifying
    @Query("UPDATE User u SET u.followersCount = u.followersCount + 1 WHERE u.userId = :userId")
    void incrementFollowersCount(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE User u SET u.followersCount = u.followersCount - 1 WHERE u.userId = :userId")
    void decrementFollowersCount(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE User u SET u.followingCount = u.followingCount + 1 WHERE u.userId = :userId")
    void incrementFollowingCount(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE User u SET u.followingCount = u.followingCount - 1 WHERE u.userId = :userId")
    void decrementFollowingCount(@Param("userId") Long userId);
}
