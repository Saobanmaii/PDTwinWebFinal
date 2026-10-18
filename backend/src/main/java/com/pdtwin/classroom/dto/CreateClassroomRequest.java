package com.pdtwin.classroom.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateClassroomRequest {
    @NotBlank(message = "Tên lớp không được rỗng")
    private String name;
    private String description;
    private Long teacherId;
}
