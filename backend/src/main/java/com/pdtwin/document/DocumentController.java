package com.pdtwin.document;

import com.pdtwin.common.ApiResponse;
import com.pdtwin.document.dto.DocumentResponse;
import com.pdtwin.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping("/api/classrooms/{classroomId}/documents")
    public ApiResponse<List<DocumentResponse>> list(@PathVariable Long classroomId) {
        return ApiResponse.ok(documentService.findByClassroom(classroomId));
    }

    @PostMapping("/api/classrooms/{classroomId}/documents")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ApiResponse<DocumentResponse> upload(@PathVariable Long classroomId,
                                                 @RequestParam("file") MultipartFile file,
                                                 @AuthenticationPrincipal User user) throws IOException {
        return ApiResponse.ok(documentService.upload(classroomId, file, user), "Upload thành công");
    }

    @GetMapping("/api/documents/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) throws IOException {
        Resource resource = documentService.download(id);
        String filename = documentService.getFilename(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    @DeleteMapping("/api/documents/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ApiResponse<Void> delete(@PathVariable Long id,
                                     @AuthenticationPrincipal User user) throws IOException {
        documentService.delete(id, user);
        return ApiResponse.ok(null, "Đã xóa tài liệu");
    }
}
