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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

/**
 * Service class for managing users.
 * This class handles the business logic for creating, retrieving, updating, and deleting users.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserLoginDataRepository userLoginDataRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Adds a new user.
     *
     * @param registerUserRequest The request object containing user registration details.
     * @throws IllegalStateException if a user with the provided email already exists.
     */
    @Transactional
    public void addUser(RegisterUserRequest registerUserRequest) {
        if (userLoginDataRepository.existsByEmail(registerUserRequest.getEmail())) {
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

    /**
     * Finds a user by their ID.
     *
     * @param userId The ID of the user to find.
     * @param loggedUserId The ID of the logged-in user.
     * @return The UserDTO.
     * @throws NoSuchElementException if the user is not found.
     */
    public UserDTO findUserById(Long userId, Long loggedUserId) {
        return userRepository.findById(userId).map(u -> mapToDTO(u, loggedUserId))
                .orElseThrow(() -> new NoSuchElementException("User with this id don't exist"));
    }

    /**
     * Finds users by their first or last name.
     *
     * @param query The search query.
     * @param loggedUserId The ID of the logged-in user.
     * @param pageable The pagination information.
     * @return A page of UserDTOs.
     * @throws InvalidParameterException if the search query is null or blank.
     */
    public Page<UserDTO> findUsersByFirstNameOrLastName(String query, Long loggedUserId, Pageable pageable) {
        if (query == null || query.isBlank()) {
            throw new InvalidParameterException("Search query cannot be empty");
        }
        if (query.contains(" ")) {
            String[] names = query.split(" ");
            return userRepository.searchByFirstNameAndLastName(names[0], names[1], pageable)
                    .map(u -> mapToDTO(u, loggedUserId));
        } else {
            return userRepository.searchByFirstNameOrLastName(query, pageable)
                    .map(u -> mapToDTO(u, loggedUserId));
        }
    }

    /**
     * Updates a user's information.
     *
     * @param userId The ID of the user to update.
     * @param updateUserRequest The request object containing the updated user details.
     * @throws NoSuchElementException if the user to update is not found.
     */
    @Transactional
    public void updateUser(Long userId, UpdateUserRequest updateUserRequest) {
        User foundUser = getUserEntity(userId);
        foundUser.setFirstName(updateUserRequest.getFirstName());
        foundUser.setLastName(updateUserRequest.getLastName());
        foundUser.setSex(updateUserRequest.getSex());
        foundUser.setBirthDate(updateUserRequest.getBirthDate());
    }

    /**
     * Deletes a user.
     *
     * @param userId The ID of the user to delete.
     * @throws NoSuchElementException if the user to delete is not found.
     */
    @Transactional
    public void deleteUser(Long userId) {
        User userToDelete = getUserEntity(userId);
        userRepository.delete(userToDelete);
    }

    /**
     * Maps a User entity to a UserDTO.
     *
     * @param u The User entity.
     * @param loggedUserId The ID of the logged-in user.
     * @return The UserDTO.
     */
    private UserDTO mapToDTO(User u, Long loggedUserId) {
        boolean canEdit = u.getUserId().equals(loggedUserId);
        return new UserDTO(u.getUserId(), u.getFirstName(), u.getLastName(), u.getBirthDate(), u.getSex(),
                u.getFollowersCount(), u.getFollowingCount(), canEdit);
    }

    /**
     * Retrieves a user entity by its ID.
     *
     * @param userId The ID of the user.
     * @return The User entity.
     * @throws NoSuchElementException if the user does not exist.
     */
    private User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User with this id don't exist"));
    }
}
