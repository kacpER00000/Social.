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

@RestController
@RequestMapping("/social/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final FollowerService followerService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long userId, Authentication authentication) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(userService.findUserById(userId, userDetails.getUserId()));
    }

    @PutMapping()
    public ResponseEntity<Void> updateUser(@Valid @RequestBody UpdateUserRequest updateUserRequest,
            Authentication authentication) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        userService.updateUser(userDetails.getUserId(), updateUserRequest);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping()
    public ResponseEntity<Void> deleteUser(Authentication authentication) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        userService.deleteUser(userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<UserDTO>> findUsersByFirstNameOrLastName(@RequestParam String query,
            Authentication authentication, @PageableDefault(size = 5) Pageable pageable) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(userService.findUsersByFirstNameOrLastName(query, userDetails.getUserId(), pageable));
    }

    @PostMapping("/{targetUserId}/follow")
    public ResponseEntity<Void> follow(@PathVariable Long targetUserId, Authentication authentication) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        followerService.follow(userDetails.getUserId(), targetUserId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{targetUserId}/follow")
    public ResponseEntity<Void> unfollow(@PathVariable Long targetUserId, Authentication authentication) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        followerService.unfollow(userDetails.getUserId(), targetUserId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<Page<FollowerDTO>> getUserFollowers(@PathVariable Long userId,
            @PageableDefault Pageable pageable, Authentication authentication) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(followerService.findUserFollowers(userId, userDetails.getUserId(), pageable));
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<Page<FollowerDTO>> getUserFollowing(@PathVariable Long userId,
            @PageableDefault Pageable pageable, Authentication authentication) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(followerService.findUserFollowing(userId, userDetails.getUserId(), pageable));
    }

    @GetMapping("/{userId}/follow-status")
    public ResponseEntity<FollowerDTO> getFollowStatus(@PathVariable Long userId, Authentication authentication) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(followerService.getFollowInfo(userId, userDetails.getUserId()));
    }

    @GetMapping("/search/following")
    public ResponseEntity<Page<FollowerDTO>> searchFollowing(@RequestParam String query, @RequestParam Long userId,
            Authentication authentication, @PageableDefault Pageable pageable) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity
                .ok(followerService.findFollowingByUsername(query, userId, userDetails.getUserId(), pageable));
    }

    @GetMapping("/search/followers")
    public ResponseEntity<Page<FollowerDTO>> searchFollowers(@RequestParam String query, @RequestParam Long userId,
            Authentication authentication, @PageableDefault Pageable pageable) {
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return ResponseEntity
                .ok(followerService.findFollowersByUsername(query, userId, userDetails.getUserId(), pageable));
    }
}
