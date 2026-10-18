package com.pdtwin.auth.dto;

import com.pdtwin.user.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private String token;
    private Long userId;
    private String username;
    private String fullName;
    private Role role;
}
