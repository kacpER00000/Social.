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

/**
 * Service class for managing followers.
 * This class handles the business logic for following and unfollowing users.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class FollowerService {
    private final FollowerRepository followerRepository;
    private final UserRepository userRepository;

    /**
     * Follows a user.
     *
     * @param followerId The ID of the user who is following.
     * @param followedId The ID of the user who is being followed.
     * @throws IllegalStateException if the user attempts to follow themselves, or if they are already following the target user.
     * @throws NoSuchElementException if either the follower or the followed user does not exist.
     */
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

    /**
     * Unfollows a user.
     *
     * @param followerId The ID of the user who is unfollowing.
     * @param followedId The ID of the user who is being unfollowed.
     * @throws IllegalStateException if the user attempts to unfollow themselves, if they are not following the user, or if the relationship is missing.
     * @throws NoSuchElementException if either the follower or the followed user does not exist.
     */
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

    /**
     * Finds the users that a specific user is following.
     *
     * @param userId The ID of the user.
     * @param loggedUserId The ID of the logged-in user.
     * @param pageable The pagination information.
     * @return A page of FollowerDTOs.
     * @throws NoSuchElementException if the user does not exist.
     */
    public Page<FollowerDTO> findUserFollowing(Long userId, Long loggedUserId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new NoSuchElementException("User with this id don't exist.");
        }
        return followerRepository.findAllByFollower_UserId(userId, pageable).map(f -> mapToDTO(f, true, loggedUserId));
    }

    /**
     * Finds the followers of a specific user.
     *
     * @param userId The ID of the user.
     * @param loggedUserId The ID of the logged-in user.
     * @param pageable The pagination information.
     * @return A page of FollowerDTOs.
     * @throws NoSuchElementException if the user does not exist.
     */
    public Page<FollowerDTO> findUserFollowers(Long userId, Long loggedUserId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new NoSuchElementException("User with this id don't exist.");
        }
        return followerRepository.findAllByFollowed_UserId(userId, pageable).map(f -> mapToDTO(f, false, loggedUserId));
    }

    /**
     * Finds users that a specific user is following by their username.
     *
     * @param query The search query.
     * @param userId The ID of the user.
     * @param loggedUserId The ID of the logged-in user.
     * @param pageable The pagination information.
     * @return A page of FollowerDTOs.
     * @throws InvalidParameterException if the query is null or blank.
     * @throws NoSuchElementException if the user does not exist.
     */
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

    /**
     * Finds followers of a specific user by their username.
     *
     * @param query The search query.
     * @param userId The ID of the user.
     * @param loggedUserId The ID of the logged-in user.
     * @param pageable The pagination information.
     * @return A page of FollowerDTOs.
     * @throws InvalidParameterException if the query is null or blank.
     * @throws NoSuchElementException if the user does not exist.
     */
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

    /**
     * Gets the follow information between the logged-in user and another user.
     *
     * @param userId The ID of the other user.
     * @param loggedUserId The ID of the logged-in user.
     * @return The FollowerDTO.
     */
    public FollowerDTO getFollowInfo(Long userId, Long loggedUserId) {
        Optional<Follower> followInfo = followerRepository.findByFollower_UserIdAndFollowed_UserId(loggedUserId,
                userId);
        if (followInfo.isPresent()) {
            return mapToDTO(followInfo.get(), true, loggedUserId);
        }
        return mapToDTO(userId, loggedUserId);
    }

    /**
     * Retrieves a user by their ID.
     *
     * @param userId The ID of the user.
     * @return The User entity.
     * @throws NoSuchElementException if the user does not exist.
     */
    private User getUserById(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("Current user not found"));
    }

    /**
     * Maps a Follower entity to a FollowerDTO.
     *
     * @param follower The Follower entity.
     * @param isFollower True if the user is the follower, false otherwise.
     * @param loggedUserId The ID of the logged-in user.
     * @return The FollowerDTO.
     */
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

    /**
     * Maps a user ID to a FollowerDTO.
     *
     * @param userId The ID of the user.
     * @param loggedUserId The ID of the logged-in user.
     * @return The FollowerDTO.
     * @throws NoSuchElementException if the user mapped to the ID does not exist.
     */
    private FollowerDTO mapToDTO(Long userId, Long loggedUserId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User not found"));
        String username = user.getFirstName() + " " + user.getLastName();
        boolean isFollowing = false;
        boolean isFollowingBy = followerRepository.existsByFollower_UserIdAndFollowed_UserId(userId, loggedUserId);
        return new FollowerDTO(userId, username, null, isFollowing, isFollowingBy, user.getFollowersCount());
    }
}
