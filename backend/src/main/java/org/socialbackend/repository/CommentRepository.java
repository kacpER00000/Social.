package org.socialbackend.repository;

import org.socialbackend.model.Comment;
import org.socialbackend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment,Long> {
    Long countByPost(Post post);
    List<Comment> findAllByPostOrderByCreatedAtAsc(Post post);
}
