package org.socialbackend.repository;

import org.socialbackend.model.Post;
import org.socialbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post,Long> {
    List<Post> findAllByUserOrderByCreatedAtDesc(User user);
    List<Post> findAllByOrderByCreatedAtDesc();
}
