package org.socialbackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.socialbackend.dto.FollowerDTO;
import org.socialbackend.model.Follower;
import org.socialbackend.model.User;
import org.socialbackend.repository.FollowerRepository;
import org.socialbackend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class FollowerService {
    private final FollowerRepository followerRepository;
    private final UserRepository userRepository;

    @Transactional
    public void follow(Long followerId, Long followedId){
        if(followerId.equals(followedId)){
            throw new IllegalStateException("You cannot follow yourself.");
        }
        if(followerRepository.existsByFollower_UserIdAndFollowed_UserId(followerId,followedId)){
            throw new IllegalStateException("You are already following this user.");
        }
        User follower = userRepository.findById(followerId).orElseThrow(() -> new NoSuchElementException("User with this id don't exist."));
        User followed = userRepository.findById(followedId).orElseThrow(() -> new NoSuchElementException("User with this id don't exist."));
        Follower f = new Follower(follower,followed);
        follower.follow(f);
        followed.addFollower(f);
        userRepository.incrementFollowingCount(followerId);
        userRepository.incrementFollowersCount(followedId);
        followerRepository.save(f);
    }

    @Transactional
    public void unfollow(Long followerId, Long followedId){
        if(followerId.equals(followedId)){
            throw new IllegalStateException("You cannot unfollow yourself.");
        }
        if(!followerRepository.existsByFollower_UserIdAndFollowed_UserId(followerId,followedId)){
            throw new IllegalStateException("You aren't following this user.");
        }
        User follower = userRepository.findById(followerId).orElseThrow(() -> new NoSuchElementException("User with this id don't exist."));
        User followed = userRepository.findById(followedId).orElseThrow(() -> new NoSuchElementException("User with this id don't exist."));
        Follower f = followerRepository.findByFollower_UserIdAndFollowed_UserId(followerId,followedId).orElseThrow(() -> new IllegalStateException("Relation not found"));
        follower.unfollow(f);
        followed.removeFollower(f);
        userRepository.decrementFollowingCount(followerId);
        userRepository.decrementFollowersCount(followedId);
        followerRepository.delete(f);
    }

    public Page<FollowerDTO> findUserFollowing(Long userId, Pageable pageable){
        User follower = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User with this id don't exist."));
        return followerRepository.findAllByFollower_UserId(userId,pageable).map(f -> mapToDTO(f,true));
    }

    public Page<FollowerDTO> findUserFollowers(Long userId, Pageable pageable){
        User followed = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User with this id don't exist."));
        return followerRepository.findAllByFollowed_UserId(userId,pageable).map(f -> mapToDTO(f,false));
    }

    private FollowerDTO mapToDTO(Follower follower, boolean isFollower){
        User user = isFollower ? follower.getFollowed() : follower.getFollower();
        Long userId = user.getUserId();
        String username = user.getFirstName() + " " + user.getLastName();
        return new FollowerDTO(userId, username, follower.getStartFollowDate());
    }
}
