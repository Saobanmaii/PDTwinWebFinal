package com.pdtwin.auth;

import com.pdtwin.auth.dto.ChangePasswordRequest;
import com.pdtwin.auth.dto.LoginRequest;
import com.pdtwin.auth.dto.LoginResponse;
import com.pdtwin.common.ApiResponse;
import com.pdtwin.config.JwtUtil;
import com.pdtwin.user.User;
import com.pdtwin.user.UserRepository;
import com.pdtwin.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        User user = userRepo.findByUsername(req.getUsername()).orElseThrow();
        String token = jwtUtil.generate(user.getUsername());
        return ApiResponse.ok(LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build());
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> me(@AuthenticationPrincipal User user) {
        return ApiResponse.ok(UserResponse.from(user));
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@AuthenticationPrincipal User user,
                                             @Valid @RequestBody ChangePasswordRequest req) {
        if (!encoder.matches(req.getOldPassword(), user.getPasswordHash())) {
            return ApiResponse.error("Mật khẩu cũ không đúng");
        }
        user.setPasswordHash(encoder.encode(req.getNewPassword()));
        userRepo.save(user);
        return ApiResponse.ok(null, "Đổi mật khẩu thành công");
    }
}
