package com.pdtwin.practice;

import com.pdtwin.classroom.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    List<ClassSession> findByClassroom(Classroom classroom);
    boolean existsByClassroomAndPracticeSession(Classroom classroom, PracticeSession practiceSession);
}
