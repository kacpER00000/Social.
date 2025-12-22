package org.socialbackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.socialbackend.dto.UserDTO;
import org.socialbackend.request.RegisterUserRequest;
import org.socialbackend.request.UpdateUserRequest;
import org.socialbackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/social/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long userId){
        return ResponseEntity.ok(userService.findUserById(userId));
    }
    @PostMapping
    public ResponseEntity<Void> registerUser(@Valid @RequestBody RegisterUserRequest registerUserRequest){
        userService.addUser(registerUserRequest);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    @PutMapping("/{userId}")
    public ResponseEntity<Void> updateUser(@PathVariable Long userId, @Valid @RequestBody UpdateUserRequest updateUserRequest){
        userService.updateUser(userId,updateUserRequest);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId){
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> findUsersByFirstNameOrLastName(@RequestParam String query){
        return ResponseEntity.ok(userService.findUsersByFirstNameOrLastName(query));
    }
}
