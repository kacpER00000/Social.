package org.socialbackend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CommentServiceTest {
    @Mock
    private CommentRepository commentRepository;
    @Mock
    private PostRepository postRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private FollowerRepository followerRepository;
    @InjectMocks
    private CommentService commentService;

    @Test
    void shouldSuccessfullyAddComment(){
        Long userId = 1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userFromDb));
        Long postId = 10L;
        Post postFromDb = new Post();
        postFromDb.setPostId(postId);
        postFromDb.setUser(userFromDb);
        when(postRepository.findById(postId)).thenReturn(Optional.of(postFromDb));
        CommentRequest commentRequest = new CommentRequest("Test comment");
        CommentDTO result = commentService.addComment(postId,commentRequest,userId);
        assertEquals(commentRequest.getContent(), result.getContent());
        assertTrue(result.isCanEdit());
        assertTrue(result.isCanDelete());
        verify(postRepository, times(1)).incrementCommentCount(postId);
        verify(commentRepository, times(1)).save(any(Comment.class));
    }

    @Test
    void shouldUnsuccessfullyAddCommentBecauseOfNoUser(){
        Long userId = 1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        Long postId = 10L;
        CommentRequest commentRequest = new CommentRequest("Test comment");
        assertThrows(NoSuchElementException.class, () -> commentService.addComment(postId,commentRequest,userId));
        verify(commentRepository,never()).save(any(Comment.class));
    }

    @Test
    void shouldUnsuccessfullyAddCommentBecauseOfNoPost(){
        Long userId = 1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userFromDb));
        Long postId = 10L;
        when(postRepository.findById(postId)).thenReturn(Optional.empty());
        CommentRequest commentRequest = new CommentRequest("Test comment");
        assertThrows(NoSuchElementException.class, () -> commentService.addComment(postId,commentRequest,userId));
        verify(commentRepository,never()).save(any(Comment.class));
    }

    @Test
    void shouldSuccessfullyEditComment(){
        Long userId = 1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        Long postId = 10L;
        Post postFromDb = new Post();
        postFromDb.setPostId(postId);
        postFromDb.setUser(userFromDb);
        Long commentId = 20L;
        Comment commentFromDb = new Comment(postFromDb,userFromDb,"Test comment");
        commentFromDb.setCommentId(commentId);
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(commentFromDb));
        CommentRequest commentRequest = new CommentRequest("Test updated comment");
        commentService.updateComment(commentId,userId,commentRequest);
        assertEquals("Test updated comment", commentFromDb.getContent());
    }

    @Test
    void shouldUnsuccessfullyEditCommentBecauseOfNoComment(){
        Long userId = 1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        Long postId = 10L;
        Post postFromDb = new Post();
        postFromDb.setPostId(postId);
        postFromDb.setUser(userFromDb);
        Long commentId = 20L;
        when(commentRepository.findById(commentId)).thenReturn(Optional.empty());
        CommentRequest commentRequest = new CommentRequest("Test updated comment");
        assertThrows(NoSuchElementException.class, () -> commentService.updateComment(commentId,userId,commentRequest));
    }

    @Test
    void shouldUnsuccessfullyEditCommentBecauseOfNoPermission(){
        Long commentAuthorUserId = 1L;
        User commentAuthorUserFromDb = new User();
        commentAuthorUserFromDb.setUserId(commentAuthorUserId);
        Long postId = 10L;
        Post postFromDb = new Post();
        postFromDb.setPostId(postId);
        postFromDb.setUser(commentAuthorUserFromDb);
        Long commentId = 20L;
        Comment commentFromDb = new Comment(postFromDb,commentAuthorUserFromDb,"Test comment");
        commentFromDb.setCommentId(commentId);
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(commentFromDb));
        CommentRequest commentRequest = new CommentRequest("Test updated comment");
        Long userId = 30L;
        assertThrows(IllegalStateException.class, () -> commentService.updateComment(commentId,userId,commentRequest));
    }

    @Test
    void shouldSuccessfullyDeleteCommentByCommentAuthor(){
        Long postAuthorUserId = 1L;
        User postAuthorUserFromDb = new User();
        postAuthorUserFromDb.setUserId(postAuthorUserId);
        Long postId = 10L;
        Post postFromDb = new Post();
        postFromDb.setPostId(postId);
        postFromDb.setUser(postAuthorUserFromDb);
        Long commentAuthorUserId = 30L;
        User commentAuthorUserFromDb = new User();
        commentAuthorUserFromDb.setUserId(commentAuthorUserId);
        Long commentId = 20L;
        Comment commentFromDb = new Comment(postFromDb,commentAuthorUserFromDb,"Test comment");
        commentFromDb.setCommentId(commentId);
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(commentFromDb));
        commentService.deleteComment(commentId,commentAuthorUserId);
        verify(postRepository,times(1)).decrementCommentCount(postId);
        verify(commentRepository,times(1)).delete(commentFromDb);
    }

    @Test
    void shouldSuccessfullyDeleteCommentByPostAuthor(){
        Long postAuthorUserId = 1L;
        User postAuthorUserFromDb = new User();
        postAuthorUserFromDb.setUserId(postAuthorUserId);
        Long postId = 10L;
        Post postFromDb = new Post();
        postFromDb.setPostId(postId);
        postFromDb.setUser(postAuthorUserFromDb);
        Long commentAuthorUserId = 30L;
        User commentAuthorUserFromDb = new User();
        commentAuthorUserFromDb.setUserId(commentAuthorUserId);
        Long commentId = 20L;
        Comment commentFromDb = new Comment(postFromDb,commentAuthorUserFromDb,"Test comment");
        commentFromDb.setCommentId(commentId);
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(commentFromDb));
        commentService.deleteComment(commentId,postAuthorUserId);
        verify(postRepository,times(1)).decrementCommentCount(postId);
        verify(commentRepository,times(1)).delete(commentFromDb);
    }

    @Test
    void shouldUnsuccessfullyDeleteCommentBecauseOfNoComment(){
        Long userId = 1L;
        Long commentId = 10L;
        when(commentRepository.findById(commentId)).thenReturn(Optional.empty());
        assertThrows(NoSuchElementException.class, () -> commentService.deleteComment(commentId,userId));
    }

    @Test
    void shouldUnsuccessfullyDeleteCommentBecauseOfNoPermission(){
        Long postAuthorUserId = 1L;
        User postAuthorUserFromDb = new User();
        postAuthorUserFromDb.setUserId(postAuthorUserId);
        Long postId = 10L;
        Post postFromDb = new Post();
        postFromDb.setPostId(postId);
        postFromDb.setUser(postAuthorUserFromDb);
        Long commentAuthorUserId = 30L;
        User commentAuthorUserFromDb = new User();
        commentAuthorUserFromDb.setUserId(commentAuthorUserId);
        Long commentId = 20L;
        Comment commentFromDb = new Comment(postFromDb,commentAuthorUserFromDb,"Test comment");
        commentFromDb.setCommentId(commentId);
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(commentFromDb));
        Long randomUserId = 50L;
        assertThrows(IllegalStateException.class, () -> commentService.deleteComment(commentId,randomUserId));
    }

    @Test
    void shouldFindAndReturnCommentByCommentIdWithEditAndDeletePermission(){
        Long postAuthorUserId = 1L;
        User postAuthorUserFromDb = new User();
        postAuthorUserFromDb.setUserId(postAuthorUserId);
        Long postId = 10L;
        Post postFromDb = new Post();
        postFromDb.setPostId(postId);
        postFromDb.setUser(postAuthorUserFromDb);
        Long commentAuthorUserId = 30L;
        User commentAuthorUserFromDb = new User();
        commentAuthorUserFromDb.setUserId(commentAuthorUserId);
        Long commentId = 20L;
        Comment commentFromDb = new Comment(postFromDb,commentAuthorUserFromDb,"Test comment");
        commentFromDb.setCommentId(commentId);
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(commentFromDb));
        CommentDTO result = commentService.findCommentByCommentId(commentId,commentAuthorUserId);
        assertEquals(commentId, result.getCommentId());
        assertEquals("Test comment", result.getContent());
        assertTrue(result.isCanEdit());
        assertTrue(result.isCanDelete());
    }

    @Test
    void shouldFindAndReturnCommentByCommentIdWithDeletePermission(){
        Long postAuthorUserId = 1L;
        User postAuthorUserFromDb = new User();
        postAuthorUserFromDb.setUserId(postAuthorUserId);
        Long postId = 10L;
        Post postFromDb = new Post();
        postFromDb.setPostId(postId);
        postFromDb.setUser(postAuthorUserFromDb);
        Long commentAuthorUserId = 30L;
        User commentAuthorUserFromDb = new User();
        commentAuthorUserFromDb.setUserId(commentAuthorUserId);
        Long commentId = 20L;
        Comment commentFromDb = new Comment(postFromDb,commentAuthorUserFromDb,"Test comment");
        commentFromDb.setCommentId(commentId);
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(commentFromDb));
        CommentDTO result = commentService.findCommentByCommentId(commentId,postAuthorUserId);
        assertEquals(commentId, result.getCommentId());
        assertEquals("Test comment", result.getContent());
        assertFalse(result.isCanEdit());
        assertTrue(result.isCanDelete());
    }

    @Test
    void shouldFindAndReturnCommentByCommentIdWithoutPermissions(){
        Long postAuthorUserId = 1L;
        User postAuthorUserFromDb = new User();
        postAuthorUserFromDb.setUserId(postAuthorUserId);
        Long postId = 10L;
        Post postFromDb = new Post();
        postFromDb.setPostId(postId);
        postFromDb.setUser(postAuthorUserFromDb);
        Long commentAuthorUserId = 30L;
        User commentAuthorUserFromDb = new User();
        commentAuthorUserFromDb.setUserId(commentAuthorUserId);
        Long commentId = 20L;
        Comment commentFromDb = new Comment(postFromDb,commentAuthorUserFromDb,"Test comment");
        commentFromDb.setCommentId(commentId);
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(commentFromDb));
        Long randomUserId = 50L;
        CommentDTO result = commentService.findCommentByCommentId(commentId,randomUserId);
        assertEquals(commentId, result.getCommentId());
        assertEquals("Test comment", result.getContent());
        assertFalse(result.isCanEdit());
        assertFalse(result.isCanDelete());
    }

    @Test
    void shouldFindAndReturnCommentByCommentIdWithCommentAuthorFollowed(){
        Long postAuthorUserId = 1L;
        User postAuthorUserFromDb = new User();
        postAuthorUserFromDb.setUserId(postAuthorUserId);
        Long postId = 10L;
        Post postFromDb = new Post();
        postFromDb.setPostId(postId);
        postFromDb.setUser(postAuthorUserFromDb);
        Long commentAuthorUserId = 30L;
        User commentAuthorUserFromDb = new User();
        commentAuthorUserFromDb.setUserId(commentAuthorUserId);
        Long commentId = 20L;
        Comment commentFromDb = new Comment(postFromDb,commentAuthorUserFromDb,"Test comment");
        commentFromDb.setCommentId(commentId);
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(commentFromDb));
        when(followerRepository.existsByFollower_UserIdAndFollowed_UserId(postAuthorUserId,commentAuthorUserId)).thenReturn(true);
        CommentDTO result = commentService.findCommentByCommentId(commentId,postAuthorUserId);
        assertEquals(commentId, result.getCommentId());
        assertEquals("Test comment", result.getContent());
        assertTrue(result.isAuthorFollowed());
    }

    @Test
    void shouldFindAndReturnCommentByCommentIdWithoutCommentAuthorFollowed(){
        Long postAuthorUserId = 1L;
        User postAuthorUserFromDb = new User();
        postAuthorUserFromDb.setUserId(postAuthorUserId);
        Long postId = 10L;
        Post postFromDb = new Post();
        postFromDb.setPostId(postId);
        postFromDb.setUser(postAuthorUserFromDb);
        Long commentAuthorUserId = 30L;
        User commentAuthorUserFromDb = new User();
        commentAuthorUserFromDb.setUserId(commentAuthorUserId);
        Long commentId = 20L;
        Comment commentFromDb = new Comment(postFromDb,commentAuthorUserFromDb,"Test comment");
        commentFromDb.setCommentId(commentId);
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(commentFromDb));
        when(followerRepository.existsByFollower_UserIdAndFollowed_UserId(postAuthorUserId,commentAuthorUserId)).thenReturn(false);
        CommentDTO result = commentService.findCommentByCommentId(commentId,postAuthorUserId);
        assertEquals(commentId, result.getCommentId());
        assertEquals("Test comment", result.getContent());
        assertFalse(result.isAuthorFollowed());
    }

    @Test
    void shouldNotFindComment(){
        Long userId = 1L;
        Long commentId = 10L;
        when(commentRepository.findById(commentId)).thenReturn(Optional.empty());
        assertThrows(NoSuchElementException.class, () -> commentService.findCommentByCommentId(commentId,userId));
    }

    @Test
    void shouldFindAndReturnPostComments(){
        Long postAuthorUserId = 1L;
        User postAuthorUserFromDb = new User();
        postAuthorUserFromDb.setUserId(postAuthorUserId);
        Long postId = 10L;
        Post postFromDb = new Post();
        postFromDb.setPostId(postId);
        postFromDb.setUser(postAuthorUserFromDb);
        Long commentAuthorUserId = 30L;
        User commentAuthorUserFromDb = new User();
        commentAuthorUserFromDb.setUserId(commentAuthorUserId);
        Comment comment1FromDb = new Comment(postFromDb,commentAuthorUserFromDb,"Test comment 1");
        comment1FromDb.setCommentId(50L);
        comment1FromDb.setCreatedAt(LocalDateTime.of(2026,3,10,0,0));
        Comment comment2FromDb = new Comment(postFromDb,commentAuthorUserFromDb,"Test comment 2");
        comment2FromDb.setCommentId(60L);
        comment2FromDb.setCreatedAt(LocalDateTime.of(2026,3,11,0,0));
        Comment comment3FromDb = new Comment(postFromDb,commentAuthorUserFromDb,"Test comment 3");
        comment3FromDb.setCommentId(70L);
        comment3FromDb.setCreatedAt(LocalDateTime.of(2026,3,12,0,0));
        Page<Comment> commentsFromDb = new PageImpl<>(List.of(comment1FromDb,comment2FromDb,comment3FromDb));
        Pageable pageable = Pageable.ofSize(5);
        when(commentRepository.findAllByPost_PostIdOrderByCreatedAtAsc(postId,pageable)).thenReturn(commentsFromDb);
        Page<CommentDTO> results = commentService.findPostComments(postId,pageable,postAuthorUserId);
        assertEquals(3,results.getTotalElements());
        for(int i=0; i<results.getTotalElements(); i++){
            assertEquals(commentsFromDb.getContent().get(i).getCommentId(), results.getContent().get(i).getCommentId());
            assertEquals(commentsFromDb.getContent().get(i).getContent(), results.getContent().get(i).getContent());
            assertEquals(commentsFromDb.getContent().get(i).getPost().getPostId(), results.getContent().get(i).getPostId());
        }
    }


}
