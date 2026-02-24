package org.socialbackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.http.InvalidParameterException;
import org.socialbackend.dto.UserDTO;
import org.socialbackend.model.User;
import org.socialbackend.model.UserLoginData;
import org.socialbackend.request.UpdateUserRequest;
import org.socialbackend.repository.UserLoginDataRepository;
import org.socialbackend.repository.UserRepository;
import org.socialbackend.request.RegisterUserRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserLoginDataRepository userLoginDataRepository;
    private final PasswordEncoder passwordEncoder;
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
        newUserLoginData.setPassword(passwordEncoder.encode(registerUserRequest.getPassword()));
        u.setUserLoginData(newUserLoginData);
        userRepository.save(u);
    }
    public UserDTO findUserById(Long userId, Long loggedUserId){
        return userRepository.findById(userId).map(u -> mapToDTO(u,loggedUserId)).orElseThrow(() -> new NoSuchElementException("User with this id don't exist"));
    }
    public UserDTO findUserByEmail(String email){
        UserLoginData userLoginData = userLoginDataRepository.findByEmail(email).orElseThrow(() -> new NoSuchElementException("User with this email don't exist."));
        return mapToDTO(userLoginData.getUser(), userLoginData.getUserId());
    }
    public List<UserDTO> findUsersByFirstNameOrLastName(String query, Long loggedUserId) {
        if (query == null || query.isBlank()) {
            throw new InvalidParameterException("Search query cannot be empty");
        }
        return userRepository.findByFirstNameStartingWithIgnoreCaseOrLastNameStartingWithIgnoreCase(query, query).stream().map(u -> mapToDTO(u, loggedUserId)).toList();
    }
    @Transactional
    public void updateUser(Long userId, UpdateUserRequest updateUserRequest){
        User foundUser = getUserEntity(userId);
        foundUser.setFirstName(updateUserRequest.getFirstName());
        foundUser.setLastName(updateUserRequest.getLastName());
        foundUser.setSex(updateUserRequest.getSex());
        foundUser.setBirthDate(updateUserRequest.getBirthDate());
    }
    @Transactional
    public void deleteUser(Long userId){
        User userToDelete = getUserEntity(userId);
        userRepository.delete(userToDelete);
    }
    private UserDTO mapToDTO(User u, Long loggedUserId){
        boolean canEdit = u.getUserId().equals(loggedUserId);
        return new UserDTO(u.getUserId(),u.getFirstName(),u.getLastName(),u.getBirthDate(),u.getSex(),u.getFollowersCount(),u.getFollowingCount(), canEdit);
    }
    private User getUserEntity(Long userId){
        return userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User with this id don't exist"));
    }
}
