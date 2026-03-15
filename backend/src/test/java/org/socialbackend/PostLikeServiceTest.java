package org.socialbackend;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.socialbackend.dto.PostLikeDTO;
import org.socialbackend.model.Post;
import org.socialbackend.model.PostLike;
import org.socialbackend.model.User;
import org.socialbackend.repository.PostLikeRepository;
import org.socialbackend.repository.PostRepository;
import org.socialbackend.repository.UserRepository;
import org.socialbackend.service.PostLikeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PostLikeServiceTest {
    @Mock
    private PostRepository postRepository;
    @Mock
    private PostLikeRepository postLikeRepository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private PostLikeService postLikeService;

    @Test
    void shouldSuccessfullyLikePost(){
        Long userId = 1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        Long postOwnerUserId = 2L;
        User postOwnerFromDb = new User();
        postOwnerFromDb.setUserId(postOwnerUserId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userFromDb));
        Long postId = 10L;
        Post post = new Post(postOwnerFromDb, "Test","This is test");
        post.setPostId(postId);
        when(postLikeRepository.existsByPost_postIdAndUser_userId(postId, userId)).thenReturn(false);
        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        postLikeService.likePost(postId,userId);
        verify(postRepository, times(1)).incrementLikes(postId);
        verify(postLikeRepository, times(1)).save(any(PostLike.class));
    }

    @Test
    void shouldUnsuccessfullyLikePostBecauseAlreadyLiked(){
        Long userId = 1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        Long postOwnerUserId = 2L;
        User postOwnerFromDb = new User();
        postOwnerFromDb.setUserId(postOwnerUserId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userFromDb));
        Long postId = 10L;
        Post post = new Post(postOwnerFromDb, "Test","This is test");
        post.setPostId(postId);
        when(postLikeRepository.existsByPost_postIdAndUser_userId(postId, userId)).thenReturn(true);
        assertThrows(IllegalStateException.class, () -> postLikeService.likePost(postId,userId));
    }

    @Test
    void shouldUnsuccessfullyLikePostBecauseOfNoUser(){
        Long userId = 1L;
        when(userRepository.findById(userId)).thenThrow(NoSuchElementException.class);
        Long postId = 10L;
        assertThrows(NoSuchElementException.class, () -> postLikeService.likePost(postId, userId));
    }

    @Test
    void shouldUnsuccessfullyLikePostBecauseOfNoPost(){
        Long userId = 1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        Long postOwnerUserId = 2L;
        User postOwnerFromDb = new User();
        postOwnerFromDb.setUserId(postOwnerUserId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userFromDb));
        Long postId = 10L;
        when(postLikeRepository.existsByPost_postIdAndUser_userId(postId, userId)).thenReturn(false);
        when(postRepository.findById(postId)).thenReturn(Optional.empty());
        assertThrows(NoSuchElementException.class, ()->postLikeService.likePost(postId,userId));
    }

    @Test
    void shouldSuccessfullyUnlikePost(){
        Long userId = 1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        Long postOwnerUserId = 2L;
        User postOwnerFromDb = new User();
        postOwnerFromDb.setUserId(postOwnerUserId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userFromDb));
        Long postId = 10L;
        Post post = new Post(postOwnerFromDb, "Test","This is test");
        post.setPostId(postId);
        when(postLikeRepository.deleteByPost_postIdAndUser_userId(postId,userId)).thenReturn(1L);
        postLikeService.unlikePost(postId,userId);
        verify(postRepository, times(1)).decrementLikes(postId);
        verify(postLikeRepository,times(1)).deleteByPost_postIdAndUser_userId(postId,userId);
    }
    @Test
    void shouldUnsuccessfullyUnlikePostBecauseAlreadyLiked(){
        Long userId = 1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        Long postOwnerUserId = 2L;
        User postOwnerFromDb = new User();
        postOwnerFromDb.setUserId(postOwnerUserId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userFromDb));
        Long postId = 10L;
        Post post = new Post(postOwnerFromDb, "Test","This is test");
        post.setPostId(postId);
        when(postLikeRepository.deleteByPost_postIdAndUser_userId(postId,userId)).thenReturn(0L);
        assertThrows(IllegalStateException.class, () -> postLikeService.unlikePost(postId,userId));
    }

    @Test
    void shouldUnsuccessfullyUnlikePostBecauseNoUser(){
        Long userId = 1L;
        when(userRepository.findById(userId)).thenThrow(NoSuchElementException.class);
        Long postId = 10L;
        assertThrows(NoSuchElementException.class, () -> postLikeService.unlikePost(postId,userId));
    }

    @Test
    void shouldReturnUsersWhoLikePost(){
        User user1FromDb = new User();
        user1FromDb.setUserId(1L);
        User user2FromDb = new User();
        user2FromDb.setUserId(2L);
        User user3FromDb = new User();
        user3FromDb.setUserId(3L);
        Long postOwnerUserId = 10L;
        User postOwnerFromDb = new User();
        postOwnerFromDb.setUserId(postOwnerUserId);
        Long postId = 10L;
        Post post = new Post(postOwnerFromDb, "Test","This is test");
        post.setPostId(postId);
        Page<PostLike> usersWhoLikePost = new PageImpl<>(List.of(
                new PostLike(post,user1FromDb),
                new PostLike(post,user2FromDb),
                new PostLike(post,user3FromDb)
        ));
        Pageable pageable = Pageable.ofSize(5);
        when(postLikeRepository.findAllByPost_PostIdOrderByLikedAtDesc(postId,pageable)).thenReturn(usersWhoLikePost);
        Page<PostLikeDTO> result = postLikeService.findUserWhoLikePost(postId,pageable);
        assertEquals(3, result.getTotalElements());
        for(int i=0; i<result.getTotalElements(); i++){
            assertEquals(result.getContent().get(i).getUserId(), usersWhoLikePost.getContent().get(i).getUser().getUserId());
        }
    }
}
