package org.socialbackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.socialbackend.details.AppUserDetails;
import org.socialbackend.dto.FollowerDTO;
import org.socialbackend.dto.UserDTO;
import org.socialbackend.request.UpdateUserRequest;
import org.socialbackend.service.FollowerService;
import org.socialbackend.service.UserService;
import org.springframework.data.domain.Page;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing user profiles and follower relationships.
 * This class provides endpoints for retrieving, updating, and deleting user accounts,
 * as well as searching for users and managing follow/unfollow actions.
 * <p>
 * <b>Error Handling:</b> Missing users trigger a {@link java.util.NoSuchElementException}
 * yielding a 404 Not Found status. Invalid parameters or business rule violations
 * (such as attempting to follow an already followed user) trigger an {@link java.lang.IllegalStateException}
 * or {@link org.apache.tomcat.util.http.InvalidParameterException}, resulting in a 400 Bad Request response.
 * </p>
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@RestController
@RequestMapping("/social/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final FollowerService followerService;

    /**
     * Retrieves the profile information of a specific user.
     *
     * @param userId         The unique identifier of the user to retrieve.
     * @param authentication The security context containing the currently logged-in user.
     * @return A ResponseEntity containing the user's information mapped to a UserDTO.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long userId, Authentication authentication) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(userService.findUserById(userId, userDetails.getUserId()));
    }

    /**
     * Updates the currently authenticated user's profile information.
     *
     * @param updateUserRequest The payload containing the updated user information.
     * @param authentication    The security context containing the currently logged-in user.
     * @return An empty ResponseEntity with a 200 OK status.
     */
    @PutMapping()
    public ResponseEntity<Void> updateUser(@Valid @RequestBody UpdateUserRequest updateUserRequest,
                                           Authentication authentication) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        userService.updateUser(userDetails.getUserId(), updateUserRequest);
        return ResponseEntity.ok().build();
    }

    /**
     * Deletes the currently authenticated user's account.
     *
     * @param authentication The security context containing the currently logged-in user.
     * @return An empty ResponseEntity with a 204 No Content status.
     */
    @DeleteMapping()
    public ResponseEntity<Void> deleteUser(Authentication authentication) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        userService.deleteUser(userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Searches for users based on their first or last name.
     *
     * @param query          The search query string.
     * @param authentication The security context containing the currently logged-in user.
     * @param pageable       Pagination information.
     * @return A ResponseEntity containing a paginated list of users matching the query.
     */
    @GetMapping("/search")
    public ResponseEntity<Page<UserDTO>> findUsersByFirstNameOrLastName(@RequestParam String query,
                                                                        Authentication authentication, @PageableDefault(size = 5) Pageable pageable) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(userService.findUsersByFirstNameOrLastName(query, userDetails.getUserId(), pageable));
    }

    /**
     * Follows a target user.
     *
     * @param targetUserId   The unique identifier of the user to follow.
     * @param authentication The security context containing the currently logged-in user.
     * @return An empty ResponseEntity with a 200 OK status.
     */
    @PostMapping("/{targetUserId}/follow")
    public ResponseEntity<Void> follow(@PathVariable Long targetUserId, Authentication authentication) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        followerService.follow(userDetails.getUserId(), targetUserId);
        return ResponseEntity.ok().build();
    }

    /**
     * Unfollows a target user.
     *
     * @param targetUserId   The unique identifier of the user to unfollow.
     * @param authentication The security context containing the currently logged-in user.
     * @return An empty ResponseEntity with a 204 No Content status.
     */
    @DeleteMapping("/{targetUserId}/follow")
    public ResponseEntity<Void> unfollow(@PathVariable Long targetUserId, Authentication authentication) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        followerService.unfollow(userDetails.getUserId(), targetUserId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Retrieves a paginated list of followers for a specific user.
     *
     * @param userId         The unique identifier of the user.
     * @param pageable       Pagination information.
     * @param authentication The security context containing the currently logged-in user.
     * @return A ResponseEntity containing a paginated list of followers.
     */
    @GetMapping("/{userId}/followers")
    public ResponseEntity<Page<FollowerDTO>> getUserFollowers(@PathVariable Long userId,
                                                              @PageableDefault Pageable pageable, Authentication authentication) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(followerService.findUserFollowers(userId, userDetails.getUserId(), pageable));
    }

    /**
     * Retrieves a paginated list of users that a specific user is following.
     *
     * @param userId         The unique identifier of the user.
     * @param pageable       Pagination information.
     * @param authentication The security context containing the currently logged-in user.
     * @return A ResponseEntity containing a paginated list of followed users.
     */
    @GetMapping("/{userId}/following")
    public ResponseEntity<Page<FollowerDTO>> getUserFollowing(@PathVariable Long userId,
                                                              @PageableDefault Pageable pageable, Authentication authentication) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(followerService.findUserFollowing(userId, userDetails.getUserId(), pageable));
    }

    /**
     * Retrieves the follow status between the currently authenticated user and a target user.
     *
     * @param userId         The unique identifier of the target user.
     * @param authentication The security context containing the currently logged-in user.
     * @return A ResponseEntity containing the follow status details.
     */
    @GetMapping("/{userId}/follow-status")
    public ResponseEntity<FollowerDTO> getFollowStatus(@PathVariable Long userId, Authentication authentication) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(followerService.getFollowInfo(userId, userDetails.getUserId()));
    }

    /**
     * Searches for specific users within the 'following' list of a user.
     *
     * @param query          The search query string.
     * @param userId         The unique identifier of the user whose 'following' list is being searched.
     * @param authentication The security context containing the currently logged-in user.
     * @param pageable       Pagination information.
     * @return A ResponseEntity containing a paginated list of matching users.
     */
    @GetMapping("/search/following")
    public ResponseEntity<Page<FollowerDTO>> searchFollowing(@RequestParam String query, @RequestParam Long userId,
                                                             Authentication authentication, @PageableDefault Pageable pageable) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity
                .ok(followerService.findFollowingByUsername(query, userId, userDetails.getUserId(), pageable));
    }

    /**
     * Searches for specific users within the 'followers' list of a user.
     *
     * @param query          The search query string.
     * @param userId         The unique identifier of the user whose 'followers' list is being searched.
     * @param authentication The security context containing the currently logged-in user.
     * @param pageable       Pagination information.
     * @return A ResponseEntity containing a paginated list of matching followers.
     */
    @GetMapping("/search/followers")
    public ResponseEntity<Page<FollowerDTO>> searchFollowers(@RequestParam String query, @RequestParam Long userId,
                                                             Authentication authentication, @PageableDefault Pageable pageable) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity
                .ok(followerService.findFollowersByUsername(query, userId, userDetails.getUserId(), pageable));
    }
}