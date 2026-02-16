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

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final FollowerRepository followerRepository;

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

    @Transactional
    public void updateComment(Long commentId, Long userId, CommentRequest commentRequest){
        Comment comment = findCommentEntity(commentId);
        validateCommentEdit(comment,userId);
        comment.setContent(commentRequest.getContent());
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId){
        Comment comment = findCommentEntity(commentId);
        validateCommentDelete(comment,userId);
        Post post = comment.getPost();
        post.removeComment(comment);
        postRepository.decrementCommentCount(post.getPostId());
        commentRepository.delete(comment);
    }

    public CommentDTO findCommentByCommentId(Long commentId, Long userId){
        return commentRepository.findById(commentId).map(c -> mapToDTO(c, userId)).orElseThrow(() -> new NoSuchElementException("Comment with this id don't exist"));
    }

    public Page<CommentDTO> findPostComments(Long postId, Pageable pageable, Long userId){
        return commentRepository.findAllByPost_PostIdOrderByCreatedAtAsc(postId,pageable).map(c -> mapToDTO(c, userId));
    }

    private void validateCommentEdit(Comment comment, Long userId){
        if(!comment.getUser().getUserId().equals(userId)){
            throw new IllegalStateException("You can't edit this comment");
        }
    }

    private void validateCommentDelete(Comment comment, Long userId){
        if(!comment.getUser().getUserId().equals(userId) && !comment.getPost().getUser().getUserId().equals(userId)){
            throw new IllegalStateException("You can't delete this comment");
        }
    }

    private Comment findCommentEntity(Long commentId){
        return commentRepository.findById(commentId).orElseThrow(() -> new NoSuchElementException("Comment with this id don't exist"));
    }

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
    private User findUserById(Long userId){
        return userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("Current user not found."));
    }
}
