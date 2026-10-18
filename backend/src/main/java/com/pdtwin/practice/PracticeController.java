package com.pdtwin.practice;

import com.pdtwin.common.ApiResponse;
import com.pdtwin.practice.dto.*;
import com.pdtwin.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PracticeController {

    private final PracticeService practiceService;

    // ─── PracticeSessions ────────────────────────────────────────────────
    @GetMapping("/api/practice-sessions")
    public ApiResponse<List<PracticeSessionResponse>> listSessions() {
        return ApiResponse.ok(practiceService.findAllSessions());
    }

    @PostMapping("/api/practice-sessions")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ApiResponse<PracticeSessionResponse> createSession(
            @Valid @RequestBody CreatePracticeSessionRequest req,
            @AuthenticationPrincipal User user) {
        return ApiResponse.ok(practiceService.createSession(req, user));
    }

    @PutMapping("/api/practice-sessions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ApiResponse<PracticeSessionResponse> updateSession(
            @PathVariable Long id,
            @RequestBody CreatePracticeSessionRequest req) {
        return ApiResponse.ok(practiceService.updateSession(id, req));
    }

    @DeleteMapping("/api/practice-sessions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ApiResponse<Void> deleteSession(@PathVariable Long id) {
        practiceService.deleteSession(id);
        return ApiResponse.ok(null, "Đã xóa bài thực hành");
    }

    // ─── ClassSessions ───────────────────────────────────────────────────
    @GetMapping("/api/classrooms/{classroomId}/sessions")
    public ApiResponse<List<ClassSessionResponse>> listClassSessions(@PathVariable Long classroomId) {
        return ApiResponse.ok(practiceService.findByClassroom(classroomId));
    }

    @PostMapping("/api/classrooms/{classroomId}/sessions")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ApiResponse<ClassSessionResponse> addSession(
            @PathVariable Long classroomId,
            @RequestBody Map<String, Long> body,
            @AuthenticationPrincipal User user) {
        return ApiResponse.ok(
                practiceService.addToClassroom(classroomId, body.get("practiceSessionId"), user));
    }

    @DeleteMapping("/api/classrooms/{classroomId}/sessions/{classSessionId}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ApiResponse<Void> removeSession(@PathVariable Long classroomId,
                                            @PathVariable Long classSessionId) {
        practiceService.removeFromClassroom(classroomId, classSessionId);
        return ApiResponse.ok(null, "Đã bỏ bài thực hành khỏi lớp");
    }

    // ─── Assignments ─────────────────────────────────────────────────────
    @GetMapping("/api/class-sessions/{classSessionId}/assignments")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ApiResponse<List<AssignmentResponse>> listAssignments(@PathVariable Long classSessionId) {
        return ApiResponse.ok(practiceService.findAssignments(classSessionId));
    }

    @PostMapping("/api/class-sessions/{classSessionId}/assignments/batch")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ApiResponse<List<AssignmentResponse>> batchAssign(
            @PathVariable Long classSessionId,
            @RequestBody List<BatchAssignRequest> requests) {
        return ApiResponse.ok(practiceService.batchAssign(classSessionId, requests));
    }

    @PutMapping("/api/assignments/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ApiResponse<AssignmentResponse> updateAssignment(
            @PathVariable Long id,
            @RequestBody BatchAssignRequest req) {
        return ApiResponse.ok(practiceService.updateAssignment(id, req));
    }

    @DeleteMapping("/api/assignments/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ApiResponse<Void> deleteAssignment(@PathVariable Long id) {
        practiceService.deleteAssignment(id);
        return ApiResponse.ok(null, "Đã xóa assignment");
    }

    @GetMapping("/api/students/me/assignments")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<List<AssignmentResponse>> myAssignments(@AuthenticationPrincipal User user) {
        return ApiResponse.ok(practiceService.myAssignments(user));
    }
}
