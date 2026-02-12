package org.socialbackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.socialbackend.dto.CommentDTO;
import org.socialbackend.model.Comment;
import org.socialbackend.model.Post;
import org.socialbackend.model.User;
import org.socialbackend.repository.CommentRepository;
import org.socialbackend.repository.PostRepository;
import org.socialbackend.repository.UserLoginDataRepository;
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
    private final UserLoginDataRepository userLoginDataRepository;
    @Transactional
    public CommentDTO addComment(Long postId, CommentRequest commentRequest, String email){
        User user = findUserByEmail(email);
        Post post = postRepository.findById(postId).orElseThrow(() -> new NoSuchElementException("Post with this id don't exist"));
        Comment comment = new Comment(post,user, commentRequest.getContent());
        post.addComment(comment);
        postRepository.incrementCommentCount(postId);
        commentRepository.save(comment);
        return mapToDTO(comment);
    }

    @Transactional
    public void updateComment(Long commentId, String email, CommentRequest commentRequest){
        Comment comment = findCommentEntity(commentId);
        validateCommentOwner(comment,email);
        comment.setContent(commentRequest.getContent());
    }

    @Transactional
    public void deleteComment(Long commentId, String email){
        Comment comment = findCommentEntity(commentId);
        validateCommentOwner(comment,email);
        Post post = comment.getPost();
        post.removeComment(comment);
        postRepository.decrementCommentCount(post.getPostId());
        commentRepository.delete(comment);
    }

    public CommentDTO findCommentByCommentId(Long commentId){
        return commentRepository.findById(commentId).map(this::mapToDTO).orElseThrow(() -> new NoSuchElementException("Comment with this id don't exist"));
    }

    public Page<CommentDTO> findPostComments(Long postId, Pageable pageable){
        return commentRepository.findAllByPost_PostIdOrderByCreatedAtAsc(postId,pageable).map(this::mapToDTO);
    }

    private void validateCommentOwner(Comment comment, String email){
        User user = findUserByEmail(email);
        if(!comment.getUser().equals(user)){
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
    private User findUserByEmail(String email){
        return userLoginDataRepository.findByEmail(email).orElseThrow(() -> new NoSuchElementException("Current user not found.")).getUser();
    }
}
