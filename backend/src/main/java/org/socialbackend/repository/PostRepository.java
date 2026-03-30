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

/**
 * Repository interface for managing posts.
 * This interface provides methods for CRUD operations and custom queries on Post entities.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Repository
public interface PostRepository extends JpaRepository<Post,Long> {
    /**
     * Finds all posts by a specific user, ordered by creation date in descending order.
     *
     * @param user The user whose posts are to be retrieved.
     * @param pageable The pagination information.
     * @return A page of posts.
     */
    Page<Post> findAllByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    /**
     * Finds all posts, ordered by creation date in descending order.
     *
     * @param pageable The pagination information.
     * @return A page of posts.
     */
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Increments the likes count of a post.
     *
     * @param postId The ID of the post.
     */
    @Modifying
    @Query("UPDATE Post p SET p.likesCount = p.likesCount + 1 WHERE p.postId = :postId")
    void incrementLikes(@Param("postId") Long postId);

    /**
     * Decrements the likes count of a post.
     *
     * @param postId The ID of the post.
     */
    @Modifying
    @Query("UPDATE Post p SET p.likesCount = p.likesCount - 1 WHERE p.postId = :postId")
    void decrementLikes(@Param("postId") Long postId);

    /**
     * Increments the comment count of a post.
     *
     * @param postId The ID of the post.
     */
    @Modifying
    @Query("UPDATE Post p SET p.commentCount = p.commentCount + 1 WHERE p.postId = :postId")
    void incrementCommentCount(@Param("postId") Long postId);

    /**
     * Decrements the comment count of a post.
     *
     * @param postId The ID of the post.
     */
    @Modifying
    @Query("UPDATE Post p SET p.commentCount = p.commentCount - 1 WHERE p.postId = :postId")
    void decrementCommentCount(@Param("postId") Long postId);
}
