package org.socialbackend.repository;

import org.socialbackend.model.Comment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing comments.
 * This interface provides methods for CRUD operations and custom queries on Comment entities.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment,Long> {
    /**
     * Finds all comments for a specific post, ordered by creation date in ascending order.
     *
     * @param postId The ID of the post.
     * @param pageable The pagination information.
     * @return A page of comments.
     */
    Page<Comment> findAllByPost_PostIdOrderByCreatedAtAsc(Long postId, Pageable pageable);
}
