package org.socialbackend.repository;

import org.socialbackend.model.UserLoginData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for managing user login data.
 * This interface provides methods for CRUD operations and custom queries on UserLoginData entities.
 *
 * @author Kacper Kurek
 * @version 1.0
 */
@Repository
public interface UserLoginDataRepository extends JpaRepository<UserLoginData,Long> {
    /**
     * Finds user login data by email.
     *
     * @param email The email to search for.
     * @return An Optional containing the UserLoginData if found.
     */
    Optional<UserLoginData> findByEmail(String email);

    /**
     * Checks if user login data exists for a given email.
     *
     * @param email The email to check.
     * @return True if the email exists, false otherwise.
     */
    boolean existsByEmail(String email);
}
