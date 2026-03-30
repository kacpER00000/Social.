package org.socialbackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.socialbackend.details.AppUserDetails;
import org.socialbackend.dto.PostDTO;
import org.socialbackend.dto.PostLikeDTO;
import org.socialbackend.request.PostRequest;
import org.socialbackend.service.PostLikeService;
import org.socialbackend.service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * PostController handles all post-related operations, including creating, retrieving, updating, and deleting posts.
 * It also manages post likes and provides endpoints for fetching the latest posts.
 * <p>
 * <b>Error Handling:</b> This controller relies on a global exception handler.
 * Unsuccessful operations throw exceptions such as {@link java.util.NoSuchElementException} (mapped to 404 Not Found)
 * or {@link java.lang.IllegalStateException} (mapped to 400 Bad Request for conflicting actions, e.g., liking a post twice).
 * </p>
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@RestController
@RequestMapping("/social/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final PostLikeService postLikeService;

    /**
     * Retrieves a specific post by its ID.
     *
     * @param postId The ID of the post to retrieve.
     * @param authentication The authentication object containing the user's details.
     * @return A ResponseEntity containing the PostDTO.
     */
    @GetMapping("/{postId}")
    public ResponseEntity<PostDTO> getPost(@PathVariable Long postId, Authentication authentication){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(postService.findPostById(postId, userDetails.getUserId()));
    }

    /**
     * Creates a new post.
     *
     * @param postRequest The request body containing the post's content.
     * @param authentication The authentication object containing the user's details.
     * @return A ResponseEntity containing the created PostDTO.
     */
    @PostMapping
    public ResponseEntity<PostDTO> createPost(@Valid @RequestBody PostRequest postRequest, Authentication authentication){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.addPost(postRequest, userDetails.getUserId()));
    }

    /**
     * Updates an existing post.
     *
     * @param postId The ID of the post to update.
     * @param postRequest The request body with the updated post content.
     * @param authentication The authentication object containing the user's details.
     * @return A ResponseEntity indicating the success of the operation.
     */
    @PutMapping("/{postId}")
    public ResponseEntity<Void> updatePost(@PathVariable Long postId,@Valid @RequestBody PostRequest postRequest, Authentication authentication){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        postService.updatePost(postId,userDetails.getUserId(),postRequest);
        return ResponseEntity.ok().build();
    }

    /**
     * Deletes a post.
     *
     * @param postId The ID of the post to delete.
     * @param authentication The authentication object containing the user's details.
     * @return A ResponseEntity indicating the success of the operation.
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId,Authentication authentication){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        postService.deletePost(postId,userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Retrieves the latest posts from the platform.
     *
     * @param pageable The pagination information.
     * @param authentication The authentication object containing the user's details.
     * @return A ResponseEntity containing a page of PostDTOs.
     */
    @GetMapping("/latest")
    public ResponseEntity<Page<PostDTO>> getLatestPosts(@PageableDefault(page = 0) Pageable pageable, Authentication authentication){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(postService.findLatestPosts(pageable, userDetails.getUserId()));
    }

    /**
     * Retrieves the latest posts from a specific user.
     *
     * @param userId The ID of the user whose posts are to be retrieved.
     * @param pageable The pagination information.
     * @param authentication The authentication object containing the user's details.
     * @return A ResponseEntity containing a page of PostDTOs.
     */
    @GetMapping("/{userId}/latest")
    public ResponseEntity<Page<PostDTO>> getUserLatestPosts(@PathVariable Long userId, @PageableDefault(page = 0) Pageable pageable, Authentication authentication){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(postService.findLatestUserPosts(userId,pageable,userDetails.getUserId()));
    }

    /**
     * Likes a post.
     *
     * @param postId The ID of the post to like.
     * @param authentication The authentication object containing the user's details.
     * @return A ResponseEntity indicating the success of the operation.
     */
    @PostMapping("/{postId}/like")
    public ResponseEntity<Void> likePost(@PathVariable Long postId, Authentication authentication){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        postLikeService.likePost(postId,userDetails.getUserId());
        return ResponseEntity.ok().build();
    }

    /**
     * Unlikes a post.
     *
     * @param postId The ID of the post to unlike.
     * @param authentication The authentication object containing the user's details.
     * @return A ResponseEntity indicating the success of the operation.
     */
    @DeleteMapping("/{postId}/like")
    public ResponseEntity<Void> unlikePost(@PathVariable Long postId, Authentication authentication){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        postLikeService.unlikePost(postId,userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Retrieves a list of users who liked a specific post.
     *
     * @param postId The ID of the post.
     * @param pageable The pagination information.
     * @return A ResponseEntity containing a page of PostLikeDTOs.
     */
    @GetMapping("/{postId}/likes")
    public ResponseEntity<Page<PostLikeDTO>> getUsersWhoLikePost(@PathVariable Long postId, @PageableDefault(page=0) Pageable pageable){
        return ResponseEntity.ok(postLikeService.findUserWhoLikePost(postId,pageable));
    }
}