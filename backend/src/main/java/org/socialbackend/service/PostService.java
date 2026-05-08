package org.socialbackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.http.InvalidParameterException;
import org.socialbackend.dto.PostDTO;
import org.socialbackend.model.Post;
import org.socialbackend.model.User;
import org.socialbackend.repository.*;
import org.socialbackend.request.PostRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

/**
 * Service class for managing posts.
 * This class handles the business logic for creating, retrieving, updating, and
 * deleting posts.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    private final FollowerRepository followerRepository;

    /**
     * Adds a new post.
     *
     * @param postRequest The request object containing post details.
     * @param userId      The ID of the user creating the post.
     * @return The created PostDTO.
     * @throws NoSuchElementException if the user does not exist.
     */
    @Transactional
    public PostDTO addPost(PostRequest postRequest, Long userId) {
        User owner = findUserById(userId);
        Post post = new Post(owner, postRequest.getTitle(), postRequest.getContent(), postRequest.getImgUrl());
        owner.addPost(post);
        postRepository.save(post);
        return mapToDTO(post, userId);
    }

    /**
     * Finds a post by its ID.
     *
     * @param postId The ID of the post to find.
     * @param userId The ID of the logged-in user.
     * @return The PostDTO.
     * @throws NoSuchElementException if the post does not exist.
     */
    public PostDTO findPostById(Long postId, Long userId) {
        return postRepository.findById(postId).map(p -> mapToDTO(p, userId))
                .orElseThrow(() -> new NoSuchElementException("Post with this id don't exist"));
    }

    /**
     * Updates an existing post.
     *
     * @param postId            The ID of the post to update.
     * @param userId            The ID of the user updating the post.
     * @param updatePostRequest The request object containing the updated post
     *                          details.
     * @throws NoSuchElementException    if the post does not exist.
     * @throws InvalidParameterException if the user is not the owner of the post.
     */
    @Transactional
    public void updatePost(Long postId, Long userId, PostRequest updatePostRequest) {
        Post foundPost = getPostEntity(postId);
        validatePostOwner(foundPost, userId);
        foundPost.setTitle(updatePostRequest.getTitle());
        foundPost.setContent(updatePostRequest.getContent());
    }

    /**
     * Deletes a post.
     *
     * @param postId The ID of the post to delete.
     * @param userId The ID of the user deleting the post.
     * @throws NoSuchElementException    if the post does not exist.
     * @throws InvalidParameterException if the user is not the owner of the post.
     */
    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post postToDelete = getPostEntity(postId);
        validatePostOwner(postToDelete, userId);
        User owner = postToDelete.getUser();
        if (owner != null) {
            owner.removePost(postToDelete);
        }
        postRepository.delete(postToDelete);
    }

    /**
     * Finds the latest posts.
     *
     * @param pageable The pagination information.
     * @param userId   The ID of the logged-in user.
     * @return A page of PostDTOs.
     */
    public Page<PostDTO> findLatestPosts(Pageable pageable, Long userId) {
        return postRepository.findAllByOrderByCreatedAtDesc(pageable).map(p -> mapToDTO(p, userId));
    }

    /**
     * Finds the latest posts of a specific user.
     *
     * @param userId       The ID of the user whose posts are to be retrieved.
     * @param pageable     The pagination information.
     * @param loggedUserId The ID of the logged-in user.
     * @return A page of PostDTOs.
     * @throws NoSuchElementException if the specified user does not exist.
     */
    public Page<PostDTO> findLatestUserPosts(Long userId, Pageable pageable, Long loggedUserId) {
        User user = findUserById(userId);
        return postRepository.findAllByUserOrderByCreatedAtDesc(user, pageable).map(p -> mapToDTO(p, loggedUserId));
    }

    /**
     * Validates if the user is the owner of the post.
     *
     * @param post   The post to validate.
     * @param userId The ID of the user.
     * @throws InvalidParameterException if the user is not the owner of the post.
     */
    private void validatePostOwner(Post post, Long userId) {
        User owner = findUserById(userId);
        if (!post.getUser().equals(owner)) {
            throw new InvalidParameterException("You can only edit your posts.");
        }
    }

    /**
     * Retrieves a post entity by its ID.
     *
     * @param postId The ID of the post.
     * @return The Post entity.
     * @throws NoSuchElementException if the post does not exist.
     */
    private Post getPostEntity(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post with this id don't exist"));
    }

    /**
     * Maps a Post entity to a PostDTO.
     *
     * @param post         The Post entity.
     * @param loggedUserId The ID of the logged-in user.
     * @return The PostDTO.
     */
    private PostDTO mapToDTO(Post post, Long loggedUserId) {
        Long likesNumber = post.getLikesCount();
        Long commentCount = post.getCommentCount();
        String nickname = post.getUser().getFirstName() + " " + post.getUser().getLastName();
        boolean isLiked = postLikeRepository.existsByPost_postIdAndUser_userId(post.getPostId(), loggedUserId);
        boolean isAuthorFollowed = followerRepository.existsByFollower_UserIdAndFollowed_UserId(loggedUserId,
                post.getUser().getUserId());
        boolean canEdit = post.getUser().getUserId().equals(loggedUserId);
        return new PostDTO(post.getPostId(), post.getUser().getUserId(), nickname, post.getTitle(), post.getContent(),
                post.getImgUrl(), post.getCreatedAt(), likesNumber, commentCount, isLiked, isAuthorFollowed, canEdit);
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
