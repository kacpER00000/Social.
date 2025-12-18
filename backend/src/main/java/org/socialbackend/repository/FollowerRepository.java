package org.socialbackend.repository;

import org.socialbackend.model.Follower;
import org.socialbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowerRepository extends JpaRepository<Follower,Long> {
    Long countByFollowed(User followed);
    Long countByFollower(User follower);
    boolean existsByFollowedAndFollower(User followed, User follower);
    Optional<Follower> findByFollowedAndFollower(User followed, User follower);
    List<Follower> findAllByFollowed(User followed);
    List<Follower> findAllByFollower(User follower);
}
