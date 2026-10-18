package com.pdtwin.classroom;

import com.pdtwin.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    List<Classroom> findByTeacher(User teacher);
    List<Classroom> findByTeacher_Id(Long teacherId);
}
