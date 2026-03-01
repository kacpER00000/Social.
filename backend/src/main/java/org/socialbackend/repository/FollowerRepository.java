package org.socialbackend.repository;

import org.socialbackend.model.Follower;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FollowerRepository extends JpaRepository<Follower, Long> {
    boolean existsByFollower_UserIdAndFollowed_UserId(Long followerId, Long followedId);

    Optional<Follower> findByFollower_UserIdAndFollowed_UserId(Long followerId, Long followedId);

    Page<Follower> findAllByFollower_UserId(Long followerId, Pageable pageable);

    Page<Follower> findAllByFollowed_UserId(Long followedId, Pageable pageable);
}
