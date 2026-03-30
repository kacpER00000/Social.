package org.socialbackend.repository;

import org.socialbackend.model.Follower;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for managing followers.
 * This interface provides methods for CRUD operations and custom queries on Follower entities.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Repository
public interface FollowerRepository extends JpaRepository<Follower, Long> {
        /**
         * Checks if a follow relationship exists between two users.
         *
         * @param followerId The ID of the follower.
         * @param followedId The ID of the followed user.
         * @return True if the relationship exists, false otherwise.
         */
        boolean existsByFollower_UserIdAndFollowed_UserId(Long followerId, Long followedId);

        /**
         * Finds a follow relationship between two users.
         *
         * @param followerId The ID of the follower.
         * @param followedId The ID of the followed user.
         * @return An Optional containing the Follower entity if found.
         */
        Optional<Follower> findByFollower_UserIdAndFollowed_UserId(Long followerId, Long followedId);

        /**
         * Finds all users that a specific user is following.
         *
         * @param followerId The ID of the follower.
         * @param pageable The pagination information.
         * @return A page of Follower entities.
         */
        Page<Follower> findAllByFollower_UserId(Long followerId, Pageable pageable);

        /**
         * Finds all followers of a specific user.
         *
         * @param followedId The ID of the followed user.
         * @param pageable The pagination information.
         * @return A page of Follower entities.
         */
        Page<Follower> findAllByFollowed_UserId(Long followedId, Pageable pageable);

        /**
         * Finds followers of a specific user by their username.
         *
         * @param query The search query.
         * @param userId The ID of the user.
         * @param pageable The pagination information.
         * @return A page of Follower entities.
         */
        @Query("SELECT f FROM Follower f JOIN f.follower u WHERE f.followed.userId = :userId AND (u.firstName ILIKE %:query% OR u.lastName ILIKE %:query%)")
        Page<Follower> findFollowersByUsername(@Param("query") String query, @Param("userId") Long userId,
                        Pageable pageable);

        /**
         * Finds followers of a specific user by their username.
         *
         * @param firstName The first name to search for.
         * @param lastName The last name to search for.
         * @param userId The ID of the user.
         * @param pageable The pagination information.
         * @return A page of Follower entities.
         */
        @Query("SELECT f FROM Follower f JOIN f.follower u WHERE f.followed.userId = :userId AND (u.firstName ILIKE %:firstName% AND u.lastName ILIKE %:lastName%)")
        Page<Follower> findFollowersByUsername(@Param("firstName") String firstName, @Param("lastName") String lastName,
                        @Param("userId") Long userId, Pageable pageable);

        /**
         * Finds users that a specific user is following by their username.
         *
         * @param query The search query.
         * @param userId The ID of the user.
         * @param pageable The pagination information.
         * @return A page of Follower entities.
         */
        @Query("SELECT f FROM Follower f JOIN f.followed u WHERE f.follower.userId = :userId AND (u.firstName ILIKE %:query% OR u.lastName ILIKE %:query%)")
        Page<Follower> findFollowingByUsername(@Param("query") String query, @Param("userId") Long userId,
                        Pageable pageable);

        /**
         * Finds users that a specific user is following by their username.
         *
         * @param firstName The first name to search for.
         * @param lastName The last name to search for.
         * @param userId The ID of the user.
         * @param pageable The pagination information.
         * @return A page of Follower entities.
         */
        @Query("SELECT f FROM Follower f JOIN f.followed u WHERE f.follower.userId = :userId AND (u.firstName ILIKE %:firstName% AND u.lastName ILIKE %:lastName%)")
        Page<Follower> findFollowingByUsername(@Param("firstName") String firstName, @Param("lastName") String lastName,
                        @Param("userId") Long userId, Pageable pageable);

}
