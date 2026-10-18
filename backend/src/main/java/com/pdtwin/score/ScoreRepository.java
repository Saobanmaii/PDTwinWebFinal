package com.pdtwin.score;

import com.pdtwin.practice.Assignment;
import com.pdtwin.practice.ClassSession;
import com.pdtwin.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ScoreRepository extends JpaRepository<Score, Long> {
    Optional<Score> findByAssignment(Assignment assignment);

    @Query("SELECT s FROM Score s WHERE s.assignment.classSession = :classSession")
    List<Score> findByClassSession(ClassSession classSession);

    @Query("SELECT s FROM Score s WHERE s.assignment.student = :student")
    List<Score> findByStudent(User student);
}
