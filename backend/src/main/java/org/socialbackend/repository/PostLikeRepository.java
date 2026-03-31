package org.socialbackend.repository;

import org.socialbackend.model.PostLike;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing post likes.
 * This interface provides methods for CRUD operations and custom queries on PostLike entities.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    /**
     * Checks if a post has been liked by a specific user.
     *
     * @param postId The ID of the post.
     * @param userId The ID of the user.
     * @return True if the post has been liked, false otherwise.
     */
    boolean existsByPost_postIdAndUser_userId(Long postId, Long userId);

    /**
     * Deletes a post like by a specific user for a specific post.
     *
     * @param postId The ID of the post.
     * @param userId The ID of the user.
     * @return The number of deleted post likes.
     */
    long deleteByPost_postIdAndUser_userId(Long postId, Long userId);

    /**
     * Finds all users who liked a specific post, ordered by the time they liked it in descending order.
     *
     * @param postId The ID of the post.
     * @param pageable The pagination information.
     * @return A page of PostLike entities.
     */
    Page<PostLike> findAllByPost_PostIdOrderByLikedAtDesc(Long postId, Pageable pageable);
}
