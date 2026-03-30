package org.socialbackend.repository;

import org.socialbackend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing users.
 * This interface provides methods for CRUD operations and custom queries on User entities.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * Searches for users by their first or last name.
     *
     * @param query The search query.
     * @param pageable The pagination information.
     * @return A page of users.
     */
    @Query("SELECT u FROM User u WHERE u.firstName ILIKE %:query% OR u.lastName ILIKE %:query%")
    Page<User> searchByFirstNameOrLastName(@Param("query") String query, Pageable pageable);

    /**
     * Searches for users by their first and last name.
     *
     * @param firstName The first name to search for.
     * @param lastName The last name to search for.
     * @param pageable The pagination information.
     * @return A page of users.
     */
    @Query("SELECT u FROM User u WHERE u.firstName ILIKE %:firstName% AND u.lastName ILIKE %:lastName%")
    Page<User> searchByFirstNameAndLastName(@Param("firstName") String firstName, @Param("lastName") String lastName,
            Pageable pageable);

    /**
     * Increments the followers count of a user.
     *
     * @param userId The ID of the user.
     */
    @Modifying
    @Query("UPDATE User u SET u.followersCount = u.followersCount + 1 WHERE u.userId = :userId")
    void incrementFollowersCount(@Param("userId") Long userId);

    /**
     * Decrements the followers count of a user.
     *
     * @param userId The ID of the user.
     */
    @Modifying
    @Query("UPDATE User u SET u.followersCount = u.followersCount - 1 WHERE u.userId = :userId")
    void decrementFollowersCount(@Param("userId") Long userId);

    /**
     * Increments the following count of a user.
     *
     * @param userId The ID of the user.
     */
    @Modifying
    @Query("UPDATE User u SET u.followingCount = u.followingCount + 1 WHERE u.userId = :userId")
    void incrementFollowingCount(@Param("userId") Long userId);

    /**
     * Decrements the following count of a user.
     *
     * @param userId The ID of the user.
     */
    @Modifying
    @Query("UPDATE User u SET u.followingCount = u.followingCount - 1 WHERE u.userId = :userId")
    void decrementFollowingCount(@Param("userId") Long userId);
}
