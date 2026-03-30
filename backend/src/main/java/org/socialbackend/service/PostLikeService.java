package org.socialbackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.socialbackend.dto.PostLikeDTO;
import org.socialbackend.model.Post;
import org.socialbackend.model.PostLike;
import org.socialbackend.model.User;
import org.socialbackend.repository.PostLikeRepository;
import org.socialbackend.repository.PostRepository;
import org.socialbackend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

/**
 * Service class for managing post likes.
 * This class handles the business logic for liking and unliking posts.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class PostLikeService {
    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final UserRepository userRepository;

    /**
     * Likes a post.
     *
     * @param postId The ID of the post to like.
     * @param userId The ID of the user who is liking the post.
     * @throws IllegalStateException if the user has already liked the post.
     * @throws NoSuchElementException if the post or user does not exist.
     */
    @Transactional
    public void likePost(Long postId, Long userId) {
        User user = findUserById(userId);
        if (postLikeRepository.existsByPost_postIdAndUser_userId(postId, user.getUserId())) {
            throw new IllegalStateException("Already liked.");
        }
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post with this id don't exist"));
        postRepository.incrementLikes(postId);
        postLikeRepository.save(new PostLike(post, user));
    }

    /**
     * Unlikes a post.
     *
     * @param postId The ID of the post to unlike.
     * @param userId The ID of the user who is unliking the post.
     * @throws IllegalStateException if the post was not liked by the user prior to this action.
     * @throws NoSuchElementException if the user does not exist.
     */
    @Transactional
    public void unlikePost(Long postId, Long userId) {
        User user = findUserById(userId);
        long deletedCount = postLikeRepository.deleteByPost_postIdAndUser_userId(postId, user.getUserId());
        if (deletedCount > 0) {
            postRepository.decrementLikes(postId);
            return;
        }
        throw new IllegalStateException("Already unliked");
    }

    /**
     * Finds the users who liked a specific post.
     *
     * @param postId The ID of the post.
     * @param pageable The pagination information.
     * @return A page of PostLikeDTOs.
     */
    public Page<PostLikeDTO> findUserWhoLikePost(Long postId, Pageable pageable) {
        Page<PostLike> usersWhoLike = postLikeRepository.findAllByPost_PostIdOrderByLikedAtDesc(postId, pageable);
        return usersWhoLike.map(this::mapToDTO);
    }

    /**
     * Maps a PostLike entity to a PostLikeDTO.
     *
     * @param postLike The PostLike entity.
     * @return The PostLikeDTO.
     */
    private PostLikeDTO mapToDTO(PostLike postLike) {
        String username = postLike.getUser().getFirstName() + " " + postLike.getUser().getLastName();
        return new PostLikeDTO(username, postLike.getUser().getUserId(), postLike.getPost().getPostId(),
                postLike.getLikedAt());
    }

    /**
     * Finds a user by their ID.
     *
     * @param userId The ID of the user.
     * @return The User entity.
     * @throws NoSuchElementException if the user does not exist.
     */
    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User with that id don't exist"));
    }
}
