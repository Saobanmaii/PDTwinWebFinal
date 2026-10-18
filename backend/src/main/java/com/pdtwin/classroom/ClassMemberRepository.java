package com.pdtwin.classroom;

import com.pdtwin.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ClassMemberRepository extends JpaRepository<ClassMember, Long> {
    List<ClassMember> findByClassroom(Classroom classroom);
    List<ClassMember> findByStudent(User student);
    Optional<ClassMember> findByClassroomAndStudent(Classroom classroom, User student);
    boolean existsByClassroomAndStudent(Classroom classroom, User student);

    @Query("SELECT cm.classroom FROM ClassMember cm WHERE cm.student = :student")
    List<Classroom> findClassroomsByStudent(User student);
}
