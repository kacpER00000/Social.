package org.socialbackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.socialbackend.dto.CommentDTO;
import org.socialbackend.model.Comment;
import org.socialbackend.model.Post;
import org.socialbackend.model.User;
import org.socialbackend.repository.CommentRepository;
import org.socialbackend.repository.FollowerRepository;
import org.socialbackend.repository.PostRepository;
import org.socialbackend.repository.UserRepository;
import org.socialbackend.request.CommentRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

/**
 * Service class for managing comments.
 * This class handles the business logic for creating, retrieving, updating, and deleting comments.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final FollowerRepository followerRepository;

    /**
     * Adds a new comment to a post.
     *
     * @param postId The ID of the post to add the comment to.
     * @param commentRequest The request object containing the comment content.
     * @param loggedUserId The ID of the user creating the comment.
     * @return The created CommentDTO.
     * @throws NoSuchElementException if either the target post or the logged-in user does not exist.
     */
    @Transactional
    public CommentDTO addComment(Long postId, CommentRequest commentRequest, Long loggedUserId){
        User user = findUserById(loggedUserId);
        Post post = postRepository.findById(postId).orElseThrow(() -> new NoSuchElementException("Post with this id don't exist"));
        Comment comment = new Comment(post,user, commentRequest.getContent());
        post.addComment(comment);
        postRepository.incrementCommentCount(postId);
        commentRepository.save(comment);
        return mapToDTO(comment,loggedUserId);
    }

    /**
     * Updates an existing comment.
     *
     * @param commentId The ID of the comment to update.
     * @param userId The ID of the user updating the comment.
     * @param commentRequest The request object containing the updated comment content.
     * @throws NoSuchElementException if the comment does not exist.
     * @throws IllegalStateException if the user is not the owner of the comment.
     */
    @Transactional
    public void updateComment(Long commentId, Long userId, CommentRequest commentRequest){
        Comment comment = findCommentEntity(commentId);
        validateCommentEdit(comment,userId);
        comment.setContent(commentRequest.getContent());
    }

    /**
     * Deletes a comment.
     *
     * @param commentId The ID of the comment to delete.
     * @param userId The ID of the user deleting the comment.
     * @throws NoSuchElementException if the comment does not exist.
     * @throws IllegalStateException if the user lacks permissions (is neither the comment owner nor the post owner).
     */
    @Transactional
    public void deleteComment(Long commentId, Long userId){
        Comment comment = findCommentEntity(commentId);
        validateCommentDelete(comment,userId);
        Post post = comment.getPost();
        post.removeComment(comment);
        postRepository.decrementCommentCount(post.getPostId());
        commentRepository.delete(comment);
    }

    /**
     * Finds a comment by its ID.
     *
     * @param commentId The ID of the comment to find.
     * @param userId The ID of the logged-in user.
     * @return The CommentDTO.
     * @throws NoSuchElementException if the comment does not exist.
     */
    public CommentDTO findCommentByCommentId(Long commentId, Long userId){
        return commentRepository.findById(commentId).map(c -> mapToDTO(c, userId)).orElseThrow(() -> new NoSuchElementException("Comment with this id don't exist"));
    }

    /**
     * Finds all comments for a specific post.
     *
     * @param postId The ID of the post.
     * @param pageable The pagination information.
     * @param userId The ID of the logged-in user.
     * @return A page of CommentDTOs.
     */
    public Page<CommentDTO> findPostComments(Long postId, Pageable pageable, Long userId){
        return commentRepository.findAllByPost_PostIdOrderByCreatedAtAsc(postId,pageable).map(c -> mapToDTO(c, userId));
    }

    /**
     * Validates if the user can edit the comment.
     *
     * @param comment The comment to validate.
     * @param userId The ID of the user.
     * @throws IllegalStateException if the user is not the author of the comment.
     */
    private void validateCommentEdit(Comment comment, Long userId){
        if(!comment.getUser().getUserId().equals(userId)){
            throw new IllegalStateException("You can't edit this comment");
        }
    }

    /**
     * Validates if the user can delete the comment.
     *
     * @param comment The comment to validate.
     * @param userId The ID of the user.
     * @throws IllegalStateException if the user is neither the comment's author nor the post's author.
     */
    private void validateCommentDelete(Comment comment, Long userId){
        if(!comment.getUser().getUserId().equals(userId) && !comment.getPost().getUser().getUserId().equals(userId)){
            throw new IllegalStateException("You can't delete this comment");
        }
    }

    /**
     * Retrieves a comment entity by its ID.
     *
     * @param commentId The ID of the comment.
     * @return The Comment entity.
     * @throws NoSuchElementException if the comment does not exist.
     */
    private Comment findCommentEntity(Long commentId){
        return commentRepository.findById(commentId).orElseThrow(() -> new NoSuchElementException("Comment with this id don't exist"));
    }

    /**
     * Maps a Comment entity to a CommentDTO.
     *
     * @param comment The Comment entity.
     * @param userId The ID of the logged-in user.
     * @return The CommentDTO.
     */
    private CommentDTO mapToDTO(Comment comment, Long userId){
        User owner = comment.getUser();
        Long ownerUserId = owner.getUserId();
        String author = owner.getFirstName() + " " + owner.getLastName();
        boolean canEdit = true;
        boolean canDelete = true;
        try{
            validateCommentEdit(comment,userId);
        } catch (IllegalStateException e){
            canEdit = false;
        }
        try{
            validateCommentDelete(comment,userId);
        } catch (IllegalStateException e){
            canDelete = false;
        }
        boolean isAuthorFollowed = followerRepository.existsByFollower_UserIdAndFollowed_UserId(userId,ownerUserId);
        return new CommentDTO(comment.getCommentId(),comment.getPost().getPostId(), ownerUserId, author, comment.getContent(), comment.getCreatedAt(), canEdit, canDelete, isAuthorFollowed);
    }

    /**
     * Finds a user by their ID.
     *
     * @param userId The ID of the user.
     * @return The User entity.
     * @throws NoSuchElementException if the user does not exist.
     */
    private User findUserById(Long userId){
        return userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("Current user not found."));
    }
}
