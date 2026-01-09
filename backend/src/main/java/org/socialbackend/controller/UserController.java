package org.socialbackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.socialbackend.dto.FollowerDTO;
import org.socialbackend.dto.UserDTO;
import org.socialbackend.model.User;
import org.socialbackend.repository.FollowerRepository;
import org.socialbackend.request.RegisterUserRequest;
import org.socialbackend.request.UpdateUserRequest;
import org.socialbackend.service.FollowerService;
import org.socialbackend.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/social/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final FollowerService followerService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long userId){
        return ResponseEntity.ok(userService.findUserById(userId));
    }
    @PostMapping
    public ResponseEntity<Void> registerUser(@Valid @RequestBody RegisterUserRequest registerUserRequest){
        userService.addUser(registerUserRequest);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping()
    public ResponseEntity<Void> updateUser(@Valid @RequestBody UpdateUserRequest updateUserRequest, Authentication authentication){
        userService.updateUser(authentication.getName(), updateUserRequest);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping()
    public ResponseEntity<Void> deleteUser(Authentication authentication){
        userService.deleteUser(authentication.getName());
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> findUsersByFirstNameOrLastName(@RequestParam String query){
        return ResponseEntity.ok(userService.findUsersByFirstNameOrLastName(query));
    }
    @PostMapping("/{targetUserId}/follow")
    public ResponseEntity<Void> follow(@PathVariable Long targetUserId, Authentication authentication){
        followerService.follow(authentication.getName(), targetUserId);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/{targetUserId}/follow")
    public ResponseEntity<Void> unfollow(@PathVariable Long targetUserId, Authentication authentication){
        followerService.unfollow(authentication.getName(), targetUserId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/{userId}/followers")
    public ResponseEntity<Page<FollowerDTO>> getUserFollowers(@PathVariable Long userId,@PageableDefault Pageable pageable){
        return ResponseEntity.ok(followerService.findUserFollowers(userId, pageable));
    }
    @GetMapping("/{userId}/following")
    public ResponseEntity<Page<FollowerDTO>> getUserFollowing(@PathVariable Long userId,@PageableDefault Pageable pageable){
        return ResponseEntity.ok(followerService.findUserFollowing(userId, pageable));
    }
}