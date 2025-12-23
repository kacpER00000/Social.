package org.socialbackend.repository;

import org.socialbackend.model.Comment;
import org.socialbackend.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment,Long> {
    Page<Comment> findAllByPost_PostIdOrderByCreatedAtAsc(Long postId, Pageable pageable);
}
