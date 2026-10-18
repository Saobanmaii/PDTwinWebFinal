package com.pdtwin.practice;

import com.pdtwin.classroom.Classroom;
import com.pdtwin.classroom.ClassroomService;
import com.pdtwin.common.exception.BadRequestException;
import com.pdtwin.common.exception.ResourceNotFoundException;
import com.pdtwin.practice.dto.*;
import com.pdtwin.user.User;
import com.pdtwin.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PracticeService {

    private final PracticeSessionRepository practiceRepo;
    private final ClassSessionRepository classSessionRepo;
    private final AssignmentRepository assignmentRepo;
    private final ClassroomService classroomService;
    private final UserService userService;

    // ─── PracticeSession ────────────────────────────────────────────────
    public List<PracticeSessionResponse> findAllSessions() {
        return practiceRepo.findAll().stream().map(PracticeSessionResponse::from).toList();
    }

    public PracticeSessionResponse createSession(CreatePracticeSessionRequest req, User creator) {
        PracticeSession ps = PracticeSession.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .unitySceneName(req.getUnitySceneName())
                .lessonNumber(req.getLessonNumber() != null ? req.getLessonNumber() : 1)
                .cameraUrl(req.getCameraUrl())
                .gxWorkUrl(req.getGxWorkUrl())
                .createdBy(creator)
                .build();
        return PracticeSessionResponse.from(practiceRepo.save(ps));
    }

    public PracticeSessionResponse updateSession(Long id, CreatePracticeSessionRequest req) {
        PracticeSession ps = getPracticeOrThrow(id);
        ps.setTitle(req.getTitle());
        if (req.getDescription() != null) ps.setDescription(req.getDescription());
        ps.setUnitySceneName(req.getUnitySceneName());
        if (req.getLessonNumber() != null) ps.setLessonNumber(req.getLessonNumber());
        ps.setCameraUrl(req.getCameraUrl());
        ps.setGxWorkUrl(req.getGxWorkUrl());
        return PracticeSessionResponse.from(practiceRepo.save(ps));
    }

    public void deleteSession(Long id) {
        practiceRepo.delete(getPracticeOrThrow(id));
    }

    // ─── ClassSession ────────────────────────────────────────────────────
    public List<ClassSessionResponse> findByClassroom(Long classroomId) {
        Classroom classroom = classroomService.getOrThrow(classroomId);
        return classSessionRepo.findByClassroom(classroom).stream()
                .map(ClassSessionResponse::from).toList();
    }

    public ClassSessionResponse addToClassroom(Long classroomId, Long practiceSessionId, User adder) {
        Classroom classroom = classroomService.getOrThrow(classroomId);
        PracticeSession ps = getPracticeOrThrow(practiceSessionId);
        if (classSessionRepo.existsByClassroomAndPracticeSession(classroom, ps)) {
            throw new BadRequestException("Bài thực hành đã có trong lớp này");
        }
        ClassSession cs = ClassSession.builder()
                .classroom(classroom)
                .practiceSession(ps)
                .addedBy(adder)
                .build();
        return ClassSessionResponse.from(classSessionRepo.save(cs));
    }

    public void removeFromClassroom(Long classroomId, Long classSessionId) {
        ClassSession cs = getClassSessionOrThrow(classSessionId);
        if (!cs.getClassroom().getId().equals(classroomId)) {
            throw new BadRequestException("ClassSession không thuộc lớp này");
        }
        classSessionRepo.delete(cs);
    }

    // ─── Assignment ──────────────────────────────────────────────────────
    public List<AssignmentResponse> findAssignments(Long classSessionId) {
        ClassSession cs = getClassSessionOrThrow(classSessionId);
        return assignmentRepo.findByClassSession(cs).stream()
                .map(this::enrichWithScore)
                .toList();
    }

    public List<AssignmentResponse> batchAssign(Long classSessionId, List<BatchAssignRequest> requests) {
        ClassSession cs = getClassSessionOrThrow(classSessionId);
        return requests.stream().map(req -> {
            User student = userService.getOrThrow(req.getStudentId());
            Assignment assignment = assignmentRepo.findByClassSessionAndStudent(cs, student)
                    .orElse(Assignment.builder().classSession(cs).student(student).build());
            assignment.setStartTime(req.getStartTime());
            assignment.setEndTime(req.getEndTime());
            return enrichWithScore(assignmentRepo.save(assignment));
        }).toList();
    }

    public AssignmentResponse updateAssignment(Long id, BatchAssignRequest req) {
        Assignment a = getAssignmentOrThrow(id);
        a.setStartTime(req.getStartTime());
        a.setEndTime(req.getEndTime());
        return enrichWithScore(assignmentRepo.save(a));
    }

    public void deleteAssignment(Long id) {
        assignmentRepo.delete(getAssignmentOrThrow(id));
    }

    public List<AssignmentResponse> myAssignments(User student) {
        return assignmentRepo.findByStudent(student).stream()
                .map(this::enrichWithScore)
                .toList();
    }

    public Assignment getAssignmentOrThrow(Long id) {
        return assignmentRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy assignment id=" + id));
    }

    public void validateAccess(Assignment assignment, User student) {
        if (!assignment.getStudent().getId().equals(student.getId())) {
            throw new BadRequestException("Assignment không thuộc về bạn");
        }
        LocalDateTime now = LocalDateTime.now();
        if (assignment.getStartTime() == null || now.isBefore(assignment.getStartTime())) {
            throw new BadRequestException("Chưa đến thời gian làm bài");
        }
        if (now.isAfter(assignment.getEndTime())) {
            throw new BadRequestException("Đã hết thời gian làm bài");
        }
    }

    private AssignmentResponse enrichWithScore(Assignment a) {
        return AssignmentResponse.from(a);
    }

    private PracticeSession getPracticeOrThrow(Long id) {
        return practiceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy PracticeSession id=" + id));
    }

    public ClassSession getClassSessionOrThrow(Long id) {
        return classSessionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ClassSession id=" + id));
    }
}
