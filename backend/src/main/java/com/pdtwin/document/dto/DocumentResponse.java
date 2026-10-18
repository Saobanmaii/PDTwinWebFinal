package com.pdtwin.document.dto;

import com.pdtwin.document.Document;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class DocumentResponse {
    private Long id;
    private Long classroomId;
    private String filename;
    private String mimeType;
    private String uploadedByName;
    private LocalDateTime uploadedAt;

    public static DocumentResponse from(Document d) {
        return DocumentResponse.builder()
                .id(d.getId())
                .classroomId(d.getClassroom().getId())
                .filename(d.getFilename())
                .mimeType(d.getMimeType())
                .uploadedByName(d.getUploadedBy().getFullName())
                .uploadedAt(d.getUploadedAt())
                .build();
    }
}
