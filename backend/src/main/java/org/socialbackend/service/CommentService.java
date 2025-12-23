package org.socialbackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.socialbackend.dto.CommentDTO;
import org.socialbackend.model.Comment;
import org.socialbackend.model.Post;
import org.socialbackend.model.User;
import org.socialbackend.repository.CommentRepository;
import org.socialbackend.repository.PostRepository;
import org.socialbackend.repository.UserRepository;
import org.socialbackend.request.CreateCommentRequest;
import org.socialbackend.request.UpdateCommentRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Transactional
    public void addComment(Long postId, CreateCommentRequest createCommentRequest){
        User user = userRepository.findById(createCommentRequest.getUserId()).orElseThrow(() -> new NoSuchElementException("User with this id don't exist"));
        Post post = postRepository.findById(postId).orElseThrow(() -> new NoSuchElementException("Post with this id don't exist"));
        Comment comment = new Comment(post,user,createCommentRequest.getContent());
        post.addComment(comment);
        commentRepository.save(comment);
    }

    @Transactional
    public void updateComment(Long commentId, Long userId, UpdateCommentRequest updateCommentRequest){
        Comment comment = findCommentEntity(commentId);
        validateCommentOwner(comment,userId);
        comment.setContent(updateCommentRequest.getContent());
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId){
        Comment comment = findCommentEntity(commentId);
        validateCommentOwner(comment,userId);
        Post post = comment.getPost();
        if(!post.getUser().getUserId().equals(userId)){
            throw new IllegalStateException("You can't edit this comment");
        }
        post.removeComment(comment);
        commentRepository.delete(comment);
    }

    public CommentDTO findCommentByCommentId(Long commentId){
        return commentRepository.findById(commentId).map(this::mapToDTO).orElseThrow(() -> new NoSuchElementException("Comment with this id don't exist"));
    }

    public Page<CommentDTO> findPostComments(Long postId, Pageable pageable){
        return commentRepository.findAllByPost_PostIdOrderByCreatedAtAsc(postId,pageable).map(this::mapToDTO);
    }

    public Long countComments(Long postId){
        return commentRepository.countByPost_PostId(postId);
    }

    private void validateCommentOwner(Comment comment, Long userId){
        if(!comment.getUser().getUserId().equals(userId)){
            throw new IllegalStateException("You can't edit this comment");
        }
    }

    private Comment findCommentEntity(Long commentId){
        return commentRepository.findById(commentId).orElseThrow(() -> new NoSuchElementException("Comment with this id don't exist"));
    }

    private CommentDTO mapToDTO(Comment comment){
        User user = comment.getUser();
        Long userId = user.getUserId();
        String author = user.getFirstName() + " " + user.getLastName();
        return new CommentDTO(comment.getCommentId(), userId,author, comment.getContent(), comment.getCreatedAt());
    }
}
