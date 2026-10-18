package com.pdtwin.user;

import com.pdtwin.common.ApiResponse;
import com.pdtwin.user.dto.CreateUserRequest;
import com.pdtwin.user.dto.UpdateUserRequest;
import com.pdtwin.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<UserResponse>> list(@RequestParam(required = false) Role role) {
        return ApiResponse.ok(userService.findAll(role));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(userService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
        return ApiResponse.ok(userService.createTeacher(req), "Tạo giảng viên thành công");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> update(@PathVariable Long id, @RequestBody UpdateUserRequest req) {
        return ApiResponse.ok(userService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ApiResponse.ok(null, "Đã vô hiệu hóa tài khoản");
    }

    @PostMapping("/import-excel")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ApiResponse<List<UserResponse>> importExcel(@RequestParam("file") MultipartFile file) throws IOException {
        return ApiResponse.ok(userService.importStudentsFromExcel(file),
                "Import thành công");
    }
}
