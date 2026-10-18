package com.pdtwin.user.dto;

import com.pdtwin.user.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRequest {
    private String fullName;
    private Boolean active;
    private Role role;
}
