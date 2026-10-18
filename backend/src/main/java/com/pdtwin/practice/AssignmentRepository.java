package com.pdtwin.practice;

import com.pdtwin.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByClassSession(ClassSession classSession);
    List<Assignment> findByStudent(User student);
    Optional<Assignment> findByClassSessionAndStudent(ClassSession classSession, User student);
    boolean existsByClassSessionAndStudent(ClassSession classSession, User student);
}
