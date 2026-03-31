package org.socialbackend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.socialbackend.dto.FollowerDTO;
import org.socialbackend.model.Follower;
import org.socialbackend.model.User;
import org.socialbackend.repository.FollowerRepository;
import org.socialbackend.repository.UserRepository;
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
public class FollowerServiceTest {
    @Mock
    private FollowerRepository followerRepository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private FollowerService followerService;

    @Test
    void shouldSuccessfullyFollow(){
        Long followerId=1L;
        User follower=new User();
        follower.setUserId(followerId);
        when(userRepository.findById(followerId)).thenReturn(Optional.of(follower));
        Long followedId=10L;
        User followed=new User();
        followed.setUserId(followedId);
        when(followerRepository.existsByFollower_UserIdAndFollowed_UserId(followerId,followedId)).thenReturn(false);
        when(userRepository.findById(followedId)).thenReturn(Optional.of(followed));
        followerService.follow(followerId,followedId);
        verify(userRepository,times(1)).incrementFollowingCount(followerId);
        verify(userRepository, times(1)).incrementFollowersCount(followedId);
        verify(followerRepository,times(1)).save(any(Follower.class));
    }
    @Test
    void shouldUnsuccessfullyFollowBecauseOfFollowingYourself(){
        Long followerId=1L;
        User follower=new User();
        follower.setUserId(followerId);
        when(userRepository.findById(followerId)).thenReturn(Optional.of(follower));
        assertThrows(IllegalStateException.class, () -> followerService.follow(followerId, followerId));
        verify(followerRepository,never()).save(any(Follower.class));
    }

    @Test
    void shouldUnSuccessfullyFollowBecauseOfNoFollower(){
        Long followerId=1L;
        when(userRepository.findById(followerId)).thenReturn(Optional.empty());
        Long followedId=10L;
        assertThrows(NoSuchElementException.class, () -> followerService.follow(followerId,followedId));
        verify(followerRepository,never()).save(any(Follower.class));
    }

    @Test
    void shouldUnsuccessfullyFollowBecauseOfNoFollowed(){
        Long followerId=1L;
        User follower=new User();
        follower.setUserId(followerId);
        when(userRepository.findById(followerId)).thenReturn(Optional.of(follower));
        Long followedId=10L;
        when(followerRepository.existsByFollower_UserIdAndFollowed_UserId(followerId,followedId)).thenReturn(false);
        when(userRepository.findById(followedId)).thenReturn(Optional.empty());
        assertThrows(NoSuchElementException.class, () -> followerService.follow(followerId,followedId));
        verify(followerRepository,never()).save(any(Follower.class));
    }

    @Test
    void shouldUnsuccessfullyFollowBecauseAlreadyFollowing(){
        Long followerId=1L;
        User follower=new User();
        follower.setUserId(followerId);
        when(userRepository.findById(followerId)).thenReturn(Optional.of(follower));
        Long followedId=10L;
        when(followerRepository.existsByFollower_UserIdAndFollowed_UserId(followerId,followedId)).thenReturn(true);
        assertThrows(IllegalStateException.class, () -> followerService.follow(followerId,followedId));
        verify(followerRepository,never()).save(any(Follower.class));
    }

    @Test
    void shouldSuccessfullyUnfollow(){
        Long followerId=1L;
        User follower=new User();
        follower.setUserId(followerId);
        when(userRepository.findById(followerId)).thenReturn(Optional.of(follower));
        Long followedId=10L;
        User followed=new User();
        followed.setUserId(followedId);
        when(followerRepository.existsByFollower_UserIdAndFollowed_UserId(followerId,followedId)).thenReturn(true);
        when(userRepository.findById(followedId)).thenReturn(Optional.of(followed));
        Follower followRelation = new Follower(follower,followed);
        when(followerRepository.findByFollower_UserIdAndFollowed_UserId(followerId,followedId)).thenReturn(Optional.of(followRelation));
        followerService.unfollow(followerId,followedId);
        verify(followerRepository,times(1)).delete(followRelation);
    }

    @Test
    void shouldUnsuccessfullyUnfollowBecauseOfUnfollowingYourself(){
        Long followerId=1L;
        User follower=new User();
        follower.setUserId(followerId);
        when(userRepository.findById(followerId)).thenReturn(Optional.of(follower));
        assertThrows(IllegalStateException.class, () -> followerService.unfollow(followerId, followerId));
    }

    @Test
    void shouldUnSuccessfullyUnfollowBecauseOfNoFollower(){
        Long followerId=1L;
        when(userRepository.findById(followerId)).thenReturn(Optional.empty());
        Long followedId=10L;
        assertThrows(NoSuchElementException.class, () -> followerService.unfollow(followerId,followedId));
    }

    @Test
    void shouldUnsuccessfullyUnfollowBecauseOfNoFollowed(){
        Long followerId=1L;
        User follower=new User();
        follower.setUserId(followerId);
        when(userRepository.findById(followerId)).thenReturn(Optional.of(follower));
        Long followedId=10L;
        when(followerRepository.existsByFollower_UserIdAndFollowed_UserId(followerId,followedId)).thenReturn(true);
        when(userRepository.findById(followedId)).thenReturn(Optional.empty());
        assertThrows(NoSuchElementException.class, () -> followerService.unfollow(followerId,followedId));
    }

    @Test
    void shouldUnsuccessfullyUnfollowBecauseAlreadyUnfollowing(){
        Long followerId=1L;
        User follower=new User();
        follower.setUserId(followerId);
        when(userRepository.findById(followerId)).thenReturn(Optional.of(follower));
        Long followedId=10L;
        when(followerRepository.existsByFollower_UserIdAndFollowed_UserId(followerId,followedId)).thenReturn(false);
        assertThrows(IllegalStateException.class, () -> followerService.unfollow(followerId,followedId));
    }

    @Test
    void shouldUnsuccessfullyUnfollowBecauseOfNoFollowRelation(){
        Long followerId=1L;
        User follower=new User();
        follower.setUserId(followerId);
        when(userRepository.findById(followerId)).thenReturn(Optional.of(follower));
        Long followedId=10L;
        User followed=new User();
        followed.setUserId(followedId);
        when(followerRepository.existsByFollower_UserIdAndFollowed_UserId(followerId,followedId)).thenReturn(true);
        when(userRepository.findById(followedId)).thenReturn(Optional.of(followed));
        when(followerRepository.findByFollower_UserIdAndFollowed_UserId(followerId,followedId)).thenReturn(Optional.empty());
        assertThrows(IllegalStateException.class, () -> followerService.unfollow(followerId,followedId));
    }

    @Test
    void shouldFindAndReturnUserFollowing(){
        Long loggedUserId=99L;
        Long followerId=1L;
        User follower=new User();
        follower.setUserId(followerId);
        when(userRepository.existsById(followerId)).thenReturn(true);
        User followed1 = new User();
        followed1.setUserId(10L);
        User followed2 = new User();
        followed2.setUserId(20L);
        User followed3 = new User();
        followed3.setUserId(30L);
        Follower followRelation1 = new Follower(follower,followed1);
        Follower followRelation2 = new Follower(follower,followed2);
        Follower followRelation3 = new Follower(follower,followed3);
        Page<Follower> following = new PageImpl<>(List.of(followRelation1,followRelation2,followRelation3));
        Pageable pageable = Pageable.ofSize(5);
        when(followerRepository.findAllByFollower_UserId(followerId,pageable)).thenReturn(following);
        Page<FollowerDTO> result = followerService.findUserFollowing(followerId,loggedUserId,pageable);
        assertEquals(3, result.getTotalElements());
        for(int i=0; i<result.getTotalElements(); i++){
            assertEquals(following.getContent().get(i).getFollowed().getUserId(), result.getContent().get(i).getUserId());
            assertFalse(result.getContent().get(i).isFollowing());
            assertFalse(result.getContent().get(i).isFollowingBy());
        }
    }

    @Test
    void shouldFindAndReturnUserFollowingAndFollowingByLoggedUser(){
        Long loggedUserId=99L;
        User loggedUser = new User();
        loggedUser.setUserId(loggedUserId);
        LocalDateTime startFollowDate = LocalDateTime.of(2026,3,16,0,0);
        Long followerId=1L;
        User follower=new User();
        follower.setUserId(followerId);
        when(userRepository.existsById(followerId)).thenReturn(true);
        Long followed1Id = 10L;
        User followed1 = new User();
        followed1.setUserId(followed1Id);
        Long followed2Id = 20L;
        User followed2 = new User();
        followed2.setUserId(followed2Id);
        Long followed3Id = 30L;
        User followed3 = new User();
        followed3.setUserId(followed3Id);
        Follower followRelation1 = new Follower(follower,followed1);
        Follower followRelation2 = new Follower(follower,followed2);
        Follower followRelation3 = new Follower(follower,followed3);
        Follower loggedUserFollowRelation = new Follower(loggedUser, followed1);
        loggedUserFollowRelation.setStartFollowDate(startFollowDate);
        Page<Follower> following = new PageImpl<>(List.of(followRelation1,followRelation2,followRelation3));
        Pageable pageable = Pageable.ofSize(5);
        when(followerRepository.findAllByFollower_UserId(followerId,pageable)).thenReturn(following);
        when(followerRepository.existsByFollower_UserIdAndFollowed_UserId(loggedUserId,followed1Id)).thenReturn(true);
        when(followerRepository.findByFollower_UserIdAndFollowed_UserId(loggedUserId,
                followed1Id)).thenReturn(Optional.of(loggedUserFollowRelation));
        Page<FollowerDTO> result = followerService.findUserFollowing(followerId,loggedUserId,pageable);
        assertEquals(3, result.getTotalElements());
        for(int i=0; i<result.getTotalElements(); i++){
            assertEquals(following.getContent().get(i).getFollowed().getUserId(), result.getContent().get(i).getUserId());
            assertFalse(result.getContent().get(i).isFollowingBy());
        }
        assertTrue(result.getContent().getFirst().isFollowing());
        assertEquals(startFollowDate, result.getContent().getFirst().getFollowedSince());
    }
    @Test
    void shouldFindAndReturnUserFollowingAndFollowingBy(){
        Long loggedUserId=99L;
        Long followerId=1L;
        User follower=new User();
        follower.setUserId(followerId);
        when(userRepository.existsById(followerId)).thenReturn(true);
        Long followed1Id = 10L;
        User followed1 = new User();
        followed1.setUserId(followed1Id);
        Long followed2Id = 20L;
        User followed2 = new User();
        followed2.setUserId(followed2Id);
        Long followed3Id = 30L;
        User followed3 = new User();
        followed3.setUserId(followed3Id);
        Follower followRelation1 = new Follower(follower,followed1);
        Follower followRelation2 = new Follower(follower,followed2);
        Follower followRelation3 = new Follower(follower,followed3);
        Page<Follower> following = new PageImpl<>(List.of(followRelation1,followRelation2,followRelation3));
        Pageable pageable = Pageable.ofSize(5);
        when(followerRepository.findAllByFollower_UserId(followerId,pageable)).thenReturn(following);
        when(followerRepository.existsByFollower_UserIdAndFollowed_UserId(loggedUserId,followed1Id)).thenReturn(false);
        when(followerRepository.existsByFollower_UserIdAndFollowed_UserId(followed1Id,loggedUserId)).thenReturn(true);
        Page<FollowerDTO> result = followerService.findUserFollowing(followerId,loggedUserId,pageable);
        assertEquals(3, result.getTotalElements());
        for(int i=0; i<result.getTotalElements(); i++){
            assertEquals(following.getContent().get(i).getFollowed().getUserId(), result.getContent().get(i).getUserId());
            assertFalse(result.getContent().get(i).isFollowing());
        }
        assertTrue(result.getContent().getFirst().isFollowingBy());
    }
    @Test
    void shouldNotFindUserFollowingBecauseOfNoFollower(){
        Long loggedUserId=99L;
        Long followerId=1L;
        Pageable pageable = Pageable.ofSize(5);
        when(userRepository.existsById(followerId)).thenReturn(false);
        assertThrows(NoSuchElementException.class, () -> followerService.findUserFollowing(followerId,loggedUserId,pageable));
    }

    @Test
    void shouldFindAndReturnUserFollowers(){
        Long loggedUserId=99L;
        Long followedId=1L;
        User followed=new User();
        followed.setUserId(followedId);
        when(userRepository.existsById(followedId)).thenReturn(true);
        User follower1 = new User();
        follower1.setUserId(10L);
        User follower2 = new User();
        follower2.setUserId(20L);
        User follower3 = new User();
        follower3.setUserId(30L);
        Follower followRelation1 = new Follower(follower1,followed);
        Follower followRelation2 = new Follower(follower2,followed);
        Follower followRelation3 = new Follower(follower3,followed);
        Page<Follower> followers = new PageImpl<>(List.of(followRelation1,followRelation2,followRelation3));
        Pageable pageable = Pageable.ofSize(5);
        when(followerRepository.findAllByFollowed_UserId(followedId,pageable)).thenReturn(followers);
        Page<FollowerDTO> result = followerService.findUserFollowers(followedId,loggedUserId,pageable);
        assertEquals(3, result.getTotalElements());
        for(int i=0; i<result.getTotalElements(); i++){
            assertEquals(followers.getContent().get(i).getFollower().getUserId(), result.getContent().get(i).getUserId());
        }
    }

    @Test
    void shouldNotFindUserFollowingBecauseOfNoFollowed(){
        Long loggedUserId=99L;
        Long followedId=1L;
        Pageable pageable = Pageable.ofSize(5);
        when(userRepository.existsById(followedId)).thenReturn(false);
        assertThrows(NoSuchElementException.class, () -> followerService.findUserFollowers(followedId,loggedUserId,pageable));
    }

    @Test
    void shouldFindUserFollowingByUsernameSingleWord(){
        String query="John";
        Long loggedUserId=99L;
        Long followerId=1L;
        User follower=new User();
        follower.setUserId(followerId);
        when(userRepository.existsById(followerId)).thenReturn(true);
        User followed1 = new User();
        followed1.setUserId(10L);
        followed1.setFirstName("John");
        followed1.setLastName("Doe");
        User followed2 = new User();
        followed2.setUserId(20L);
        followed2.setFirstName("John");
        followed2.setLastName("Smith");
        User followed3 = new User();
        followed3.setUserId(30L);
        followed3.setFirstName("John");
        followed3.setLastName("Legend");
        Follower followRelation1 = new Follower(follower,followed1);
        Follower followRelation2 = new Follower(follower,followed2);
        Follower followRelation3 = new Follower(follower,followed3);
        Page<Follower> following = new PageImpl<>(List.of(followRelation1,followRelation2,followRelation3));
        Pageable pageable = Pageable.ofSize(5);
        when(followerRepository.findFollowingByUsername(query,followerId,pageable)).thenReturn(following);
        Page<FollowerDTO> result = followerService.findFollowingByUsername(query,followerId,loggedUserId,pageable);
        assertEquals(3, result.getTotalElements());
        for(int i=0; i<result.getTotalElements(); i++){
            assertEquals(following.getContent().get(i).getFollowed().getUserId(), result.getContent().get(i).getUserId());
        }
    }

    @Test
    void shouldFindUserFollowingByFullUsername(){
        String query="John Do";
        String[] names = query.split(" ");
        Long loggedUserId=99L;
        Long followerId=1L;
        User follower=new User();
        follower.setUserId(followerId);
        when(userRepository.existsById(followerId)).thenReturn(true);
        User followed1 = new User();
        followed1.setUserId(10L);
        followed1.setFirstName("John");
        followed1.setLastName("Doe");
        User followed2 = new User();
        followed2.setUserId(20L);
        followed2.setFirstName("John");
        followed2.setLastName("Doberman");
        User followed3 = new User();
        followed3.setUserId(30L);
        followed3.setFirstName("John");
        followed3.setLastName("Dove");
        Follower followRelation1 = new Follower(follower,followed1);
        Follower followRelation2 = new Follower(follower,followed2);
        Follower followRelation3 = new Follower(follower,followed3);
        Page<Follower> following = new PageImpl<>(List.of(followRelation1,followRelation2,followRelation3));
        Pageable pageable = Pageable.ofSize(5);
        when(followerRepository.findFollowingByUsername(names[0],names[1],followerId,pageable)).thenReturn(following);
        Page<FollowerDTO> result = followerService.findFollowingByUsername(query,followerId,loggedUserId,pageable);
        assertEquals(3, result.getTotalElements());
        for(int i=0; i<result.getTotalElements(); i++){
            assertEquals(following.getContent().get(i).getFollowed().getUserId(), result.getContent().get(i).getUserId());
        }
    }

    @Test
    void shouldNotFindFollowingByUsernameBecauseOfNoFollower(){
        String query="John";
        Long loggedUserId=99L;
        Long followerId=1L;
        Pageable pageable = Pageable.ofSize(5);
        when(userRepository.existsById(followerId)).thenReturn(false);
        assertThrows(NoSuchElementException.class, () -> followerService.findFollowingByUsername(query,followerId,loggedUserId,pageable));
    }

    @Test
    void shouldFindUserFollowersByUsernameSingleWord(){
        String query="John";
        Long loggedUserId=99L;
        Long followedId=1L;
        User followed=new User();
        followed.setUserId(followedId);
        when(userRepository.existsById(followedId)).thenReturn(true);
        User follower1 = new User();
        follower1.setUserId(10L);
        follower1.setFirstName("John");
        follower1.setLastName("Doe");
        User follower2 = new User();
        follower2.setUserId(20L);
        follower2.setFirstName("John");
        follower2.setLastName("Smith");
        User follower3 = new User();
        follower3.setUserId(30L);
        follower3.setFirstName("John");
        follower3.setLastName("Legend");
        Follower followRelation1 = new Follower(follower1,followed);
        Follower followRelation2 = new Follower(follower2,followed);
        Follower followRelation3 = new Follower(follower3,followed);
        Page<Follower> followers = new PageImpl<>(List.of(followRelation1,followRelation2,followRelation3));
        Pageable pageable = Pageable.ofSize(5);
        when(followerRepository.findFollowersByUsername(query,followedId,pageable)).thenReturn(followers);
        Page<FollowerDTO> result = followerService.findFollowersByUsername(query,followedId,loggedUserId,pageable);
        assertEquals(3, result.getTotalElements());
        for(int i=0; i<result.getTotalElements(); i++){
            assertEquals(followers.getContent().get(i).getFollower().getUserId(), result.getContent().get(i).getUserId());
        }
    }

    @Test
    void shouldFindUserFollowersByFullUsername(){
        String query="John Do";
        String[] names = query.split(" ");
        Long loggedUserId=99L;
        Long followedId=1L;
        User followed=new User();
        followed.setUserId(followedId);
        when(userRepository.existsById(followedId)).thenReturn(true);
        User follower1 = new User();
        follower1.setUserId(10L);
        follower1.setFirstName("John");
        follower1.setLastName("Doe");
        User follower2 = new User();
        follower2.setUserId(20L);
        follower2.setFirstName("John");
        follower2.setLastName("Doberman");
        User follower3 = new User();
        follower3.setUserId(30L);
        follower3.setFirstName("John");
        follower3.setLastName("Dove");
        Follower followRelation1 = new Follower(follower1,followed);
        Follower followRelation2 = new Follower(follower2,followed);
        Follower followRelation3 = new Follower(follower3,followed);
        Page<Follower> followers = new PageImpl<>(List.of(followRelation1,followRelation2,followRelation3));
        Pageable pageable = Pageable.ofSize(5);
        when(followerRepository.findFollowersByUsername(names[0],names[1],followedId,pageable)).thenReturn(followers);
        Page<FollowerDTO> result = followerService.findFollowersByUsername(query,followedId,loggedUserId,pageable);
        assertEquals(3, result.getTotalElements());
        for(int i=0; i<result.getTotalElements(); i++){
            assertEquals(followers.getContent().get(i).getFollower().getUserId(), result.getContent().get(i).getUserId());
        }
    }
    @Test
    void shouldNotFindFollowersByUsernameBecauseOfNoFollowed(){
        String query="John";
        Long loggedUserId=99L;
        Long followedId=1L;
        Pageable pageable = Pageable.ofSize(5);
        when(userRepository.existsById(followedId)).thenReturn(false);
        assertThrows(NoSuchElementException.class, () -> followerService.findFollowersByUsername(query,followedId,loggedUserId,pageable));
    }
    @Test
    void shouldGetFollowInfoWhenLoggedUserIsFollowing(){
        LocalDateTime startFollowDate = LocalDateTime.of(2026,3,16,0,0);
        Long loggedUserId=99L;
        User loggedUser = new User();
        loggedUser.setUserId(loggedUserId);
        Long userFromDbId=1L;
        User userFromDb=new User();
        userFromDb.setUserId(userFromDbId);
        Follower followRelation = new Follower(loggedUser,userFromDb);
        followRelation.setStartFollowDate(startFollowDate);
        when(followerRepository.findByFollower_UserIdAndFollowed_UserId(loggedUserId,userFromDbId)).thenReturn(Optional.of(followRelation));
        when(followerRepository.existsByFollower_UserIdAndFollowed_UserId(loggedUserId,userFromDbId)).thenReturn(true);
        FollowerDTO result = followerService.getFollowInfo(userFromDbId,loggedUserId);
        assertEquals(userFromDbId,result.getUserId());
        assertEquals(startFollowDate, result.getFollowedSince());
        assertTrue(result.isFollowing());
    }

    @Test
    void shouldGetFollowInfoWhenLoggedUserIsNotFollowing(){
        Long loggedUserId=99L;
        Long userFromDbId=1L;
        User userFromDb=new User();
        userFromDb.setUserId(userFromDbId);
        when(followerRepository.findByFollower_UserIdAndFollowed_UserId(loggedUserId,userFromDbId)).thenReturn(Optional.empty());
        when(userRepository.findById(userFromDbId)).thenReturn(Optional.of(userFromDb));
        FollowerDTO result = followerService.getFollowInfo(userFromDbId,loggedUserId);
        assertEquals(userFromDbId,result.getUserId());
        assertNull(result.getFollowedSince());
        assertFalse(result.isFollowing());
    }

    @Test
    void shouldNotGetFollowInfoBecauseOfNoUser(){
        Long loggedUserId=99L;
        Long userFromDbId=1L;
        when(followerRepository.findByFollower_UserIdAndFollowed_UserId(loggedUserId,userFromDbId)).thenReturn(Optional.empty());
        when(userRepository.findById(userFromDbId)).thenReturn(Optional.empty());
        assertThrows(NoSuchElementException.class,() -> followerService.getFollowInfo(userFromDbId,loggedUserId));
    }
}
