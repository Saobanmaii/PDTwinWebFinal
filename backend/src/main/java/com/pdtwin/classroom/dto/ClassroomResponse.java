package com.pdtwin.classroom.dto;

import com.pdtwin.classroom.Classroom;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ClassroomResponse {
    private Long id;
    private String name;
    private String description;
    private Long teacherId;
    private String teacherName;
    private LocalDateTime createdAt;

    public static ClassroomResponse from(Classroom c) {
        return ClassroomResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .teacherId(c.getTeacher().getId())
                .teacherName(c.getTeacher().getFullName())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
