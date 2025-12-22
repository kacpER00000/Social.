package org.socialbackend.repository;

import org.socialbackend.model.Post;
import org.socialbackend.model.PostLike;
import org.socialbackend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike,Long> {
    boolean existsByPost_postIdAndUser_userId(Long postId, Long userId);
    long deleteByPost_postIdAndUser_userId(Long postId, Long userId);
    Page<PostLike> findAllByPost_PostId(Long postId, Pageable pageable);
}
