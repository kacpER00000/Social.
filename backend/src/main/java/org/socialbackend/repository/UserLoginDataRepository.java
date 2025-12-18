package org.socialbackend.repository;

import org.socialbackend.model.UserLoginData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserLoginDataRepository extends JpaRepository<UserLoginData,Long> {
    Optional<UserLoginData> findByEmail(String email);
    boolean existsByEmail(String email);
}
