package org.socialbackend.repository;

import org.socialbackend.model.Post;
import org.socialbackend.model.PostLike;
import org.socialbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike,Long> {
    Long countByPost(Post post);
    boolean existsByPostAndUser(Post post, User user);
    Optional<PostLike> findByPostAndUser(Post post, User user);
}
