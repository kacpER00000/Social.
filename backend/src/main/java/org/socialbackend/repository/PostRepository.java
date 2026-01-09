package org.socialbackend.repository;

import org.socialbackend.model.Post;
import org.socialbackend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post,Long> {
    Page<Post> findAllByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
    @Modifying
    @Query("UPDATE Post p SET p.likesCount = p.likesCount + 1 WHERE p.postId = :postId")
    void incrementLikes(@Param("postId") Long postId);
    @Modifying
    @Query("UPDATE Post p SET p.likesCount = p.likesCount - 1 WHERE p.postId = :postId")
    void decrementLikes(@Param("postId") Long postId);
    @Modifying
    @Query("UPDATE Post p SET p.commentCount = p.commentCount + 1 WHERE p.postId = :postId")
    void incrementCommentCount(@Param("postId") Long postId);
    @Modifying
    @Query("UPDATE Post p SET p.commentCount = p.commentCount - 1 WHERE p.postId = :postId")
    void decrementCommentCount(@Param("postId") Long postId);
}
