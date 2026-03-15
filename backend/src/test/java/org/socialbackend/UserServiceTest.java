package org.socialbackend;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.socialbackend.dto.UserDTO;
import org.socialbackend.model.User;
import org.socialbackend.repository.UserLoginDataRepository;
import org.socialbackend.repository.UserRepository;
import org.socialbackend.request.RegisterUserRequest;
import org.socialbackend.request.UpdateUserRequest;
import org.socialbackend.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.apache.tomcat.util.http.InvalidParameterException;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserLoginDataRepository userLoginDataRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldSuccessfullyAddUser() {
        RegisterUserRequest registerUserRequest = new RegisterUserRequest("John", "Doe", LocalDate.of(2000, 1, 1), 'M', "john.doe@example.com", "SuperSecretPassword");
        when(userLoginDataRepository.existsByEmail("john.doe@example.com")).thenReturn(false);
        when(passwordEncoder.encode("SuperSecretPassword")).thenReturn("Encoded_password");

        userService.addUser(registerUserRequest);

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void shouldUnsuccessfullyAddUser() {
        RegisterUserRequest registerUserRequest = new RegisterUserRequest("John", "Doe", LocalDate.of(2000, 1, 1), 'M', "john.doe@example.com", "SuperSecretPassword");
        when(userLoginDataRepository.existsByEmail("john.doe@example.com")).thenReturn(true);

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> userService.addUser(registerUserRequest));

        assertEquals("User with this email already exists", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldSuccessfullyUpdateUser() {
        Long userId = 1L;
        User existingUser = new User("John", "Doe", LocalDate.of(2000, 1, 1), 'M', null);
        UpdateUserRequest updateUserRequest = new UpdateUserRequest("John", "Doe", LocalDate.of(2004, 5, 20), 'M');
        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));

        userService.updateUser(userId, updateUserRequest);

        assertEquals("John", existingUser.getFirstName());
        assertEquals("Doe", existingUser.getLastName());
        assertEquals(LocalDate.of(2004, 5, 20), existingUser.getBirthDate());
        assertEquals('M', existingUser.getSex());
    }

    @Test
    void shouldUnsuccessfullyUpdateUser() {
        Long userId = 999L;
        UpdateUserRequest updateUserRequest = new UpdateUserRequest();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> userService.updateUser(userId, updateUserRequest));
    }

    @Test
    void shouldSuccessfullyDeleteUser() {
        Long userId = 1L;
        User existingUser = new User("John", "Doe", LocalDate.of(2000, 1, 1), 'M', null);
        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));

        userService.deleteUser(userId);

        verify(userRepository, times(1)).delete(existingUser);
    }

    @Test
    void shouldUnsuccessfullyDeleteUser() {
        Long userId = 1L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> userService.deleteUser(userId));
    }

    @Test
    void shouldReturnUserDtoByIdWithEditPermissionWhenLookingAtOwnProfile() {
        Long userId = 1L;
        Long loggedUserId = 1L;
        User fakeUserFromDB = new User();
        fakeUserFromDB.setUserId(userId);
        fakeUserFromDB.setFirstName("John");
        when(userRepository.findById(userId)).thenReturn(Optional.of(fakeUserFromDB));

        UserDTO result = userService.findUserById(userId, loggedUserId);

        assertEquals("John", result.getFirstName());
        assertTrue(result.isCanEdit());
    }

    @Test
    void shouldReturnUserDtoByIdWithoutEditPermissionWhenLookingAtOtherProfile() {
        Long userId = 1L;
        Long loggedUserId = 2L;
        User fakeUserFromDB = new User();
        fakeUserFromDB.setUserId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(fakeUserFromDB));

        UserDTO result = userService.findUserById(userId, loggedUserId);

        assertFalse(result.isCanEdit());
    }

    @Test
    void shouldNotFindUsersByFirstNameOrLastName() {
        Long loggedUserId = 1L;
        Pageable pageable = Pageable.ofSize(5);

        assertThrows(InvalidParameterException.class, () -> userService.findUsersByFirstNameOrLastName(null, loggedUserId, pageable));
    }

    @Test
    void shouldFindUsersByFirstNameOrLastName() {
        String query = "John";
        Long loggedUserId = 1L;
        Pageable pageable = Pageable.ofSize(5);

        User foundUser1 = new User();
        foundUser1.setUserId(2L);
        foundUser1.setFirstName("John");
        foundUser1.setLastName("Doe");

        User foundUser2 = new User();
        foundUser2.setUserId(3L);
        foundUser2.setFirstName("John");
        foundUser2.setLastName("Smith");

        Page<User> userPageFromDb = new PageImpl<>(List.of(foundUser1, foundUser2));
        when(userRepository.searchByFirstNameOrLastName(query, pageable)).thenReturn(userPageFromDb);

        Page<UserDTO> result = userService.findUsersByFirstNameOrLastName(query, loggedUserId, pageable);

        assertEquals(2, result.getTotalElements());

        UserDTO returnedDto1 = result.getContent().get(0);
        UserDTO returnedDto2 = result.getContent().get(1);

        assertEquals("John", returnedDto1.getFirstName());
        assertEquals("Doe", returnedDto1.getLastName());

        assertEquals("John", returnedDto2.getFirstName());
        assertEquals("Smith", returnedDto2.getLastName());
    }

    @Test
    void shouldFindUsersByFirstNameAndLastName() {
        String query = "John Do";
        String[] names = query.split(" ");
        Long loggedUserId = 1L;
        Pageable pageable = Pageable.ofSize(5);

        User foundUser = new User();
        foundUser.setUserId(2L);
        foundUser.setFirstName("John");
        foundUser.setLastName("Doe");

        Page<User> userPageFromDb = new PageImpl<>(List.of(foundUser));
        when(userRepository.searchByFirstNameAndLastName(names[0], names[1], pageable)).thenReturn(userPageFromDb);

        Page<UserDTO> result = userService.findUsersByFirstNameOrLastName(query, loggedUserId, pageable);

        assertEquals(1, result.getTotalElements());
        UserDTO returnedDto = result.getContent().getFirst();

        assertEquals("John", returnedDto.getFirstName());
        assertEquals("Doe", returnedDto.getLastName());
    }
    @Test
    void shouldThrowExceptionWhenFindingNonExistingUserById() {
        Long userId = 999L;
        Long loggedUserId = 1L;

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> userService.findUserById(userId, loggedUserId));
    }
}