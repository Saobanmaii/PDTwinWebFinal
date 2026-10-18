package com.pdtwin.classroom;

import com.pdtwin.classroom.dto.ClassroomResponse;
import com.pdtwin.classroom.dto.CreateClassroomRequest;
import com.pdtwin.common.ApiResponse;
import com.pdtwin.user.User;
import com.pdtwin.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService classroomService;

    @GetMapping
    public ApiResponse<List<ClassroomResponse>> list(@AuthenticationPrincipal User user) {
        return ApiResponse.ok(classroomService.findAll(user));
    }

    @GetMapping("/{id}")
    public ApiResponse<ClassroomResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(classroomService.findById(id));
    }

    @PostMapping
    public ApiResponse<ClassroomResponse> create(@Valid @RequestBody CreateClassroomRequest req,
                                                  @AuthenticationPrincipal User user) {
        return ApiResponse.ok(classroomService.create(req, user), "Tạo lớp thành công");
    }

    @PutMapping("/{id}")
    public ApiResponse<ClassroomResponse> update(@PathVariable Long id,
                                                  @RequestBody CreateClassroomRequest req,
                                                  @AuthenticationPrincipal User user) {
        return ApiResponse.ok(classroomService.update(id, req, user));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
        classroomService.delete(id, user);
        return ApiResponse.ok(null, "Đã xóa lớp");
    }

    @GetMapping("/{id}/members")
    public ApiResponse<List<UserResponse>> members(@PathVariable Long id) {
        return ApiResponse.ok(classroomService.getMembers(id));
    }

    @PostMapping("/{id}/members/import")
    public ApiResponse<List<UserResponse>> importMembers(@PathVariable Long id,
                                                          @RequestParam("file") MultipartFile file,
                                                          @AuthenticationPrincipal User user) throws IOException {
        return ApiResponse.ok(classroomService.importMembers(id, file, user), "Import thành công");
    }

    @DeleteMapping("/{id}/members/{studentId}")
    public ApiResponse<Void> removeMember(@PathVariable Long id,
                                           @PathVariable Long studentId,
                                           @AuthenticationPrincipal User user) {
        classroomService.removeMember(id, studentId, user);
        return ApiResponse.ok(null, "Đã xóa sinh viên khỏi lớp");
    }
}
