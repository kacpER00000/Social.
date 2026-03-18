package org.socialbackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.http.InvalidParameterException;
import org.socialbackend.dto.FollowerDTO;
import org.socialbackend.model.Follower;
import org.socialbackend.model.User;
import org.socialbackend.repository.FollowerRepository;
import org.socialbackend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FollowerService {
    private final FollowerRepository followerRepository;
    private final UserRepository userRepository;

    @Transactional
    public void follow(Long followerId, Long followedId) {
        User follower = getUserById(followerId);
        if (followerId.equals(followedId)) {
            throw new IllegalStateException("You cannot follow yourself.");
        }
        if (followerRepository.existsByFollower_UserIdAndFollowed_UserId(followerId, followedId)) {
            throw new IllegalStateException("You are already following this user.");
        }
        User followed = userRepository.findById(followedId)
                .orElseThrow(() -> new NoSuchElementException("User with this id don't exist."));
        Follower f = new Follower(follower, followed);
        follower.follow(f);
        followed.addFollower(f);
        userRepository.incrementFollowingCount(followerId);
        userRepository.incrementFollowersCount(followedId);
        followerRepository.save(f);
    }

    @Transactional
    public void unfollow(Long followerId, Long followedId) {
        User follower = getUserById(followerId);
        if (followerId.equals(followedId)) {
            throw new IllegalStateException("You cannot unfollow yourself.");
        }
        if (!followerRepository.existsByFollower_UserIdAndFollowed_UserId(followerId, followedId)) {
            throw new IllegalStateException("You aren't following this user.");
        }
        User followed = userRepository.findById(followedId)
                .orElseThrow(() -> new NoSuchElementException("User with this id don't exist."));
        Follower f = followerRepository.findByFollower_UserIdAndFollowed_UserId(followerId, followedId)
                .orElseThrow(() -> new IllegalStateException("Relation not found"));
        follower.unfollow(f);
        followed.removeFollower(f);
        followerRepository.delete(f);
    }

    public Page<FollowerDTO> findUserFollowing(Long userId, Long loggedUserId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new NoSuchElementException("User with this id don't exist.");
        }
        return followerRepository.findAllByFollower_UserId(userId, pageable).map(f -> mapToDTO(f, true, loggedUserId));
    }

    public Page<FollowerDTO> findUserFollowers(Long userId, Long loggedUserId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new NoSuchElementException("User with this id don't exist.");
        }
        return followerRepository.findAllByFollowed_UserId(userId, pageable).map(f -> mapToDTO(f, false, loggedUserId));
    }

    public Page<FollowerDTO> findFollowingByUsername(String query, Long userId, Long loggedUserId, Pageable pageable) {
        if (query == null || query.isBlank()) {
            throw new InvalidParameterException("Search query cannot be empty");
        }
        if (!userRepository.existsById(userId)) {
            throw new NoSuchElementException("User with this id don't exist.");
        }
        if (query.contains(" ")) {
            String[] names = query.split(" ");
            return followerRepository.findFollowingByUsername(names[0], names[1], userId, pageable)
                    .map(f -> mapToDTO(f, true, loggedUserId));
        }
        return followerRepository.findFollowingByUsername(query, userId, pageable)
                .map(f -> mapToDTO(f, true, loggedUserId));
    }

    public Page<FollowerDTO> findFollowersByUsername(String query, Long userId, Long loggedUserId, Pageable pageable) {
        if (query == null || query.isBlank()) {
            throw new InvalidParameterException("Search query cannot be empty");
        }
        if (!userRepository.existsById(userId)) {
            throw new NoSuchElementException("User with this id don't exist.");
        }
        if (query.contains(" ")) {
            String[] names = query.split(" ");
            return followerRepository.findFollowersByUsername(names[0], names[1], userId, pageable)
                    .map(f -> mapToDTO(f, false, loggedUserId));
        }
        return followerRepository.findFollowersByUsername(query, userId, pageable)
                .map(f -> mapToDTO(f, false, loggedUserId));
    }

    public FollowerDTO getFollowInfo(Long userId, Long loggedUserId) {
        Optional<Follower> followInfo = followerRepository.findByFollower_UserIdAndFollowed_UserId(loggedUserId,
                userId);
        if (followInfo.isPresent()) {
            return mapToDTO(followInfo.get(), true, loggedUserId);
        }
        return mapToDTO(userId, loggedUserId);
    }

    private User getUserById(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("Current user not found"));
    }

    private FollowerDTO mapToDTO(Follower follower, boolean isFollower, Long loggedUserId) {
        User user = isFollower ? follower.getFollowed() : follower.getFollower();
        Long userId = user.getUserId();
        String username = user.getFirstName() + " " + user.getLastName();
        boolean isFollowing = followerRepository.existsByFollower_UserIdAndFollowed_UserId(loggedUserId, userId);
        boolean isFollowingBy = followerRepository.existsByFollower_UserIdAndFollowed_UserId(userId, loggedUserId);
        LocalDateTime followedSince = null;
        Optional<Follower> followInfo = followerRepository.findByFollower_UserIdAndFollowed_UserId(loggedUserId,
                userId);
        if (isFollowing && followInfo.isPresent()) {
            followedSince = followInfo.get().getStartFollowDate();
        }
        return new FollowerDTO(userId, username, followedSince, isFollowing, isFollowingBy, user.getFollowersCount());
    }

    private FollowerDTO mapToDTO(Long userId, Long loggedUserId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User not found"));
        String username = user.getFirstName() + " " + user.getLastName();
        boolean isFollowing = false;
        boolean isFollowingBy = followerRepository.existsByFollower_UserIdAndFollowed_UserId(userId, loggedUserId);
        return new FollowerDTO(userId, username, null, isFollowing, isFollowingBy, user.getFollowersCount());
    }
}
