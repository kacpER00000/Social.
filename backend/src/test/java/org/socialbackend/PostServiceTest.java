package org.socialbackend;

import org.apache.tomcat.util.http.InvalidParameterException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.socialbackend.dto.PostDTO;
import org.socialbackend.model.Post;
import org.socialbackend.model.User;
import org.socialbackend.repository.FollowerRepository;
import org.socialbackend.repository.PostLikeRepository;
import org.socialbackend.repository.PostRepository;
import org.socialbackend.repository.UserRepository;
import org.socialbackend.request.PostRequest;
import org.socialbackend.service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PostServiceTest {
    @Mock
    private PostRepository postRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PostLikeRepository postLikeRepository;
    @Mock
    private FollowerRepository followerRepository;
    @InjectMocks
    private PostService postService;

    @Test
    void shouldSuccessfullyAddPost(){
        Long userId = 1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        PostRequest postRequest = new PostRequest("Title", "Content");
        when(userRepository.findById(userId)).thenReturn(Optional.of(userFromDb));
        PostDTO result = postService.addPost(postRequest,userId);
        verify(postRepository, times(1)).save(any(Post.class));
        assertEquals(userId, result.getAuthorId());
    }

    @Test
    void shouldUnsuccessfullyAddPost(){
        Long userId = 1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        PostRequest postRequest = new PostRequest("Title", "Content");
        when(userRepository.findById(userId)).thenThrow(NoSuchElementException.class);
        assertThrows(NoSuchElementException.class, () -> postService.addPost(postRequest, userId));
        verify(postRepository,never()).save(any(Post.class));
    }

    @Test
    void shouldFindAndReturnPostByIdWithEditPermission(){
        Long userId=1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        Long postId=1L;
        Post postFromDb = new Post(userFromDb, "Test","This is test");
        postFromDb.setPostId(postId);
        when(postRepository.findById(postId)).thenReturn(Optional.of(postFromDb));
        PostDTO result = postService.findPostById(postId, userId);
        assertEquals("Test",result.getTitle());
        assertEquals("This is test",result.getContent());
        assertTrue(result.isCanEdit());
    }
    @Test
    void shouldFindAndReturnPostByIdWithoutEditPermission(){
        Long userId=1L;
        Long postOwnerId=2L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        Long postId=1L;
        Post postFromDb = new Post(userFromDb, "Test","This is test");
        postFromDb.setPostId(postId);
        when(postRepository.findById(postId)).thenReturn(Optional.of(postFromDb));
        PostDTO result = postService.findPostById(postId, postOwnerId);
        assertEquals("Test",result.getTitle());
        assertEquals("This is test",result.getContent());
        assertFalse(result.isCanEdit());
    }

    @Test
    void shouldFindAndReturnPostByIdWithLike(){
        Long authorUserId=1L;
        User authorUserFromDb = new User();
        authorUserFromDb.setUserId(authorUserId);
        Long userId=1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        Long postId=1L;
        Post postFromDb = new Post(authorUserFromDb, "Test","This is test");
        postFromDb.setPostId(postId);
        when(postRepository.findById(postId)).thenReturn(Optional.of(postFromDb));
        when(postLikeRepository.existsByPost_postIdAndUser_userId(postId,userId)).thenReturn(true);
        PostDTO result = postService.findPostById(postId, userId);
        assertEquals("Test",result.getTitle());
        assertEquals("This is test",result.getContent());
        assertTrue(result.getIsLiked());
    }

    @Test
    void shouldFindAndReturnPostByIdWithoutLike(){
        Long authorUserId=1L;
        User authorUserFromDb = new User();
        authorUserFromDb.setUserId(authorUserId);
        Long userId=1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        Long postId=1L;
        Post postFromDb = new Post(authorUserFromDb, "Test","This is test");
        postFromDb.setPostId(postId);
        when(postRepository.findById(postId)).thenReturn(Optional.of(postFromDb));
        when(postLikeRepository.existsByPost_postIdAndUser_userId(postId,userId)).thenReturn(false);
        PostDTO result = postService.findPostById(postId, userId);
        assertEquals("Test",result.getTitle());
        assertEquals("This is test",result.getContent());
        assertFalse(result.getIsLiked());
    }

    @Test
    void shouldFindAndReturnPostByIdWithAuthorFollowed(){
        Long authorUserId=1L;
        User authorUserFromDb = new User();
        authorUserFromDb.setUserId(authorUserId);
        Long loggedUserId=2L;
        User userFromDb = new User();
        userFromDb.setUserId(authorUserId);
        Long postId=1L;
        Post postFromDb = new Post(authorUserFromDb, "Test","This is test");
        postFromDb.setPostId(postId);
        when(postRepository.findById(postId)).thenReturn(Optional.of(postFromDb));
        when(followerRepository.existsByFollower_UserIdAndFollowed_UserId(loggedUserId,authorUserId)).thenReturn(true);
        PostDTO result = postService.findPostById(postId, loggedUserId);
        assertEquals("Test",result.getTitle());
        assertEquals("This is test",result.getContent());
        assertTrue(result.getIsAuthorFollowed());
    }

    @Test
    void shouldFindAndReturnPostByIdWithoutAuthorFollowed(){
        Long authorUserId=1L;
        User authorUserFromDb = new User();
        authorUserFromDb.setUserId(authorUserId);
        Long loggedUserId=2L;
        User userFromDb = new User();
        userFromDb.setUserId(authorUserId);
        Long postId=1L;
        Post postFromDb = new Post(authorUserFromDb, "Test","This is test");
        postFromDb.setPostId(postId);
        when(postRepository.findById(postId)).thenReturn(Optional.of(postFromDb));
        when(followerRepository.existsByFollower_UserIdAndFollowed_UserId(loggedUserId,authorUserId)).thenReturn(false);
        PostDTO result = postService.findPostById(postId, loggedUserId);
        assertEquals("Test",result.getTitle());
        assertEquals("This is test",result.getContent());
        assertFalse(result.getIsAuthorFollowed());
    }


    @Test
    void shouldSuccessfullyUpdatePost(){
        Long userId = 1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        Long postId = 1L;
        Post postFromDb = new Post(userFromDb, "Test","This is test");
        PostRequest updateRequest = new PostRequest("Updated", "This is updated");
        postFromDb.setPostId(postId);
        when(postRepository.findById(postId)).thenReturn(Optional.of(postFromDb));
        when(userRepository.findById(userId)).thenReturn(Optional.of(userFromDb));
        postService.updatePost(postId, userId,updateRequest);
        assertEquals("Updated", postFromDb.getTitle());
        assertEquals("This is updated", postFromDb.getContent());
    }

    @Test
    void shouldUnsuccessfullyUpdatePost(){
        Long userId = 1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        User postOwner = new User();
        userFromDb.setUserId(2L);
        Long postId = 1L;
        Post postFromDb = new Post(postOwner, "Test","This is test");
        PostRequest updateRequest = new PostRequest("Updated", "This is updated");
        postFromDb.setPostId(postId);
        when(postRepository.findById(postId)).thenReturn(Optional.of(postFromDb));
        when(userRepository.findById(userId)).thenReturn(Optional.of(userFromDb));
        assertThrows(InvalidParameterException.class, () -> postService.updatePost(postId, userId, updateRequest));
    }
    @Test
    void shouldSuccessfullyDeletePost(){
        Long userId = 1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        Long postId = 1L;
        Post postFromDb = new Post(userFromDb, "Test","This is test");
        postFromDb.setPostId(postId);
        when(postRepository.findById(postId)).thenReturn(Optional.of(postFromDb));
        when(userRepository.findById(userId)).thenReturn(Optional.of(userFromDb));
        postService.deletePost(postId,userId);
        verify(postRepository,times(1)).delete(postFromDb);
    }
    @Test
    void shouldUnsuccessfullyDeletePost(){
        Long userId = 1L;
        User userFromDb = new User();
        userFromDb.setUserId(userId);
        User postOwner = new User();
        postOwner.setUserId(2L);
        Long postId = 1L;
        Post postFromDb = new Post(postOwner, "Test","This is test");
        postFromDb.setPostId(postId);
        when(postRepository.findById(postId)).thenReturn(Optional.of(postFromDb));
        when(userRepository.findById(userId)).thenReturn(Optional.of(userFromDb));
        assertThrows(InvalidParameterException.class, () -> postService.deletePost(postId, userId));
    }
    @Test
    void shouldFindLatestPost(){
        Long user1Id = 1L;
        Long user2Id = 2L;
        User user1 = new User("John", "Doe",null,null,null);
        user1.setUserId(user1Id);
        User user2 = new User("John", "Smith",null,null,null);
        user2.setUserId(user2Id);
        Page<Post> latestPostFromDb = new PageImpl<>(List.of(
                new Post(user1, "Test 1", "This is test 1"),
                new Post(user1, "Test 2", "This is test 2"),
                new Post(user2, "Test 3", "This is test 3")
        ));
        Pageable pageable = Pageable.ofSize(5);
        when(postRepository.findAllByOrderByCreatedAtDesc(pageable)).thenReturn(latestPostFromDb);
        Page<PostDTO> result = postService.findLatestPosts(pageable,user1Id);
        assertEquals(3, result.getTotalElements());
        for(int i=0; i<result.getTotalElements(); i++){
            assertEquals(latestPostFromDb.getContent().get(i).getTitle(), result.getContent().get(i).getTitle());
            assertEquals(latestPostFromDb.getContent().get(i).getContent(), result.getContent().get(i).getContent());
        }
    }
    @Test
    void shouldFindLatestUserPost(){
        Long userId = 1L;
        User user = new User("John", "Doe",null,null,null);
        user.setUserId(userId);
        Page<Post> latestPostFromDb = new PageImpl<>(List.of(
                new Post(user, "Test 1", "This is test 1"),
                new Post(user, "Test 2", "This is test 2")
        ));
        Pageable pageable = Pageable.ofSize(5);
        when(postRepository.findAllByUserOrderByCreatedAtDesc(user,pageable)).thenReturn(latestPostFromDb);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Page<PostDTO> result = postService.findLatestUserPosts(userId,pageable,userId);
        assertEquals(2, result.getTotalElements());
        for(int i=0; i<result.getTotalElements(); i++){
            assertEquals(latestPostFromDb.getContent().get(i).getTitle(), result.getContent().get(i).getTitle());
            assertEquals(latestPostFromDb.getContent().get(i).getContent(), result.getContent().get(i).getContent());
        }
    }
}
