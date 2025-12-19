package org.socialbackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.http.InvalidParameterException;
import org.socialbackend.model.User;
import org.socialbackend.model.UserLoginData;
import org.socialbackend.repository.UserLoginDataRepository;
import org.socialbackend.repository.UserRepository;
import org.socialbackend.request.RegisterUserRequest;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserLoginDataRepository userLoginDataRepository;

    @Transactional
    public void addUser(RegisterUserRequest registerUserRequest){

        if(userLoginDataRepository.existsByEmail(registerUserRequest.getEmail())){
            throw new IllegalStateException("User with this email already exists");
        }
        User u = new User();
        u.setFirstName(registerUserRequest.getFirstName());
        u.setLastName(registerUserRequest.getLastName());
        u.setBirthDate(registerUserRequest.getBirthDate());
        u.setSex(registerUserRequest.getSex());
        UserLoginData newUserLoginData = new UserLoginData();
        newUserLoginData.setEmail(registerUserRequest.getEmail());
        newUserLoginData.setPassword(hashPassword(registerUserRequest.getPassword()));
        u.setUserLoginData(newUserLoginData);
        userRepository.save(u);
    }
    public User findUserById(Long userId){
        return userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + userId));
    }
    public List<User> findUsersByFirstNameOrLastName(String query) {
        if (query == null || query.isBlank()) {
            throw new InvalidParameterException("Search query cannot be empty");
        }
        return userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(query, query);
    }
    @Transactional
    public void updateUser(User u){
        User foundUser = findUserById(u.getUserId());
        foundUser.setFirstName(u.getFirstName());
        foundUser.setLastName(u.getLastName());
        foundUser.setSex(u.getSex());
        foundUser.setBirthDate(u.getBirthDate());
    }
    @Transactional
    public void deleteUser(User u){
        User userToDelete = findUserById(u.getUserId());
        userRepository.delete(userToDelete);
    }
    private String hashPassword(String password){
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
