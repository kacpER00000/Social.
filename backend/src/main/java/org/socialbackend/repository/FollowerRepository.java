package org.socialbackend.repository;

import org.socialbackend.model.Follower;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FollowerRepository extends JpaRepository<Follower, Long> {
        boolean existsByFollower_UserIdAndFollowed_UserId(Long followerId, Long followedId);

        Optional<Follower> findByFollower_UserIdAndFollowed_UserId(Long followerId, Long followedId);

        Page<Follower> findAllByFollower_UserId(Long followerId, Pageable pageable);

        Page<Follower> findAllByFollowed_UserId(Long followedId, Pageable pageable);

        @Query("SELECT f FROM Follower f JOIN f.follower u WHERE f.followed.userId = :userId AND (u.firstName ILIKE %:query% OR u.lastName ILIKE %:query%)")
        Page<Follower> findFollowersByUsername(@Param("query") String query, @Param("userId") Long userId,
                        Pageable pageable);

        @Query("SELECT f FROM Follower f JOIN f.follower u WHERE f.followed.userId = :userId AND (u.firstName ILIKE %:firstName% AND u.lastName ILIKE %:lastName%)")
        Page<Follower> findFollowersByUsername(@Param("firstName") String firstName, @Param("lastName") String lastName,
                        @Param("userId") Long userId, Pageable pageable);

        @Query("SELECT f FROM Follower f JOIN f.followed u WHERE f.follower.userId = :userId AND (u.firstName ILIKE %:query% OR u.lastName ILIKE %:query%)")
        Page<Follower> findFollowingByUsername(@Param("query") String query, @Param("userId") Long userId,
                        Pageable pageable);

        @Query("SELECT f FROM Follower f JOIN f.followed u WHERE f.follower.userId = :userId AND (u.firstName ILIKE %:firstName% AND u.lastName ILIKE %:lastName%)")
        Page<Follower> findFollowingByUsername(@Param("firstName") String firstName, @Param("lastName") String lastName,
                        @Param("userId") Long userId, Pageable pageable);

}
