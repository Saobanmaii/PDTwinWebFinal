package com.pdtwin.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserRequest {
    @NotBlank(message = "Username không được rỗng")
    private String username;

    @NotBlank(message = "Họ tên không được rỗng")
    private String fullName;

    private String password;
    private String studentId;
}
