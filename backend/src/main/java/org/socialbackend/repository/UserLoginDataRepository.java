package org.socialbackend.repository;

import org.socialbackend.model.UserLoginData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserLoginDataRepository extends JpaRepository<UserLoginData,Long> {
    Optional<UserLoginData> findByEmail(String email);
    boolean existsByEmail(String email);
}
