package org.socialbackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.socialbackend.details.AppUserDetails;
import org.socialbackend.dto.CommentDTO;
import org.socialbackend.request.CommentRequest;
import org.socialbackend.service.CommentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * CommentController is responsible for handling all comment-related operations.
 * It provides endpoints for creating, retrieving, updating, and deleting comments on posts.
 * <p>
 * <b>Error Handling:</b> This controller utilizes global exception handling.
 * Operations may return a 404 Not Found (via {@link java.util.NoSuchElementException}) if a requested
 * post or comment does not exist, or a 400 Bad Request for invalid parameters or state conflicts
 * (via {@link java.lang.IllegalStateException} or {@link org.apache.tomcat.util.http.InvalidParameterException}).
 * </p>
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@RestController
@RequestMapping("/social")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    /**
     * Retrieves all comments for a specific post.
     *
     * @param postId The ID of the post.
     * @param pageable The pagination information.
     * @param authentication The authentication object containing the user's details.
     * @return A ResponseEntity containing a page of CommentDTOs.
     */
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<Page<CommentDTO>> getPostComments(@PathVariable Long postId, @PageableDefault(page=0) Pageable pageable, Authentication authentication){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(commentService.findPostComments(postId,pageable, userDetails.getUserId()));
    }

    /**
     * Retrieves a specific comment by its ID.
     *
     * @param commentId The ID of the comment to retrieve.
     * @param authentication The authentication object containing the user's details.
     * @return A ResponseEntity containing the CommentDTO.
     */
    @GetMapping("/comments/{commentId}")
    public ResponseEntity<CommentDTO> getComment(@PathVariable Long commentId, Authentication authentication){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(commentService.findCommentByCommentId(commentId, userDetails.getUserId()));
    }

    /**
     * Creates a new comment on a post.
     *
     * @param postId The ID of the post to comment on.
     * @param commentRequest The request body containing the comment's content.
     * @param authentication The authentication object containing the user's details.
     * @return A ResponseEntity containing the created CommentDTO.
     */
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentDTO> createComment(@PathVariable Long postId, @Valid @RequestBody CommentRequest commentRequest, Authentication authentication){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.addComment(postId, commentRequest,userDetails.getUserId()));
    }

    /**
     * Edits an existing comment.
     *
     * @param commentId The ID of the comment to edit.
     * @param authentication The authentication object containing the user's details.
     * @param commentRequest The request body with the updated comment content.
     * @return A ResponseEntity indicating the success of the operation.
     */
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<Void> editComment(@PathVariable Long commentId, Authentication authentication, @Valid @RequestBody CommentRequest commentRequest){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        commentService.updateComment(commentId, userDetails.getUserId(), commentRequest);
        return ResponseEntity.ok().build();
    }

    /**
     * Deletes a comment.
     *
     * @param commentId The ID of the comment to delete.
     * @param authentication The authentication object containing the user's details.
     * @return A ResponseEntity indicating the success of the operation.
     */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId, Authentication authentication){
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        commentService.deleteComment(commentId,userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }
}