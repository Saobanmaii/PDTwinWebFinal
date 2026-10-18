package com.pdtwin.document;

import com.pdtwin.classroom.Classroom;
import com.pdtwin.classroom.ClassroomService;
import com.pdtwin.common.exception.BadRequestException;
import com.pdtwin.common.exception.ResourceNotFoundException;
import com.pdtwin.document.dto.DocumentResponse;
import com.pdtwin.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepo;
    private final ClassroomService classroomService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public List<DocumentResponse> findByClassroom(Long classroomId) {
        Classroom classroom = classroomService.getOrThrow(classroomId);
        return documentRepo.findByClassroomOrderByUploadedAtDesc(classroom)
                .stream().map(DocumentResponse::from).toList();
    }

    public DocumentResponse upload(Long classroomId, MultipartFile file, User uploader) throws IOException {
        if (!isPdf(file)) {
            throw new BadRequestException("Chỉ chấp nhận file PDF");
        }
        Classroom classroom = classroomService.getOrThrow(classroomId);

        Path dir = Paths.get(uploadDir, "classroom-" + classroomId);
        Files.createDirectories(dir);

        String storedName = UUID.randomUUID() + ".pdf";
        Path target = dir.resolve(storedName);
        file.transferTo(target);

        Document doc = Document.builder()
                .classroom(classroom)
                .filename(file.getOriginalFilename())
                .storedPath(target.toString())
                .mimeType("application/pdf")
                .uploadedBy(uploader)
                .build();

        return DocumentResponse.from(documentRepo.save(doc));
    }

    public Resource download(Long docId) throws MalformedURLException {
        Document doc = getOrThrow(docId);
        Path path = Paths.get(doc.getStoredPath());
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists()) {
            throw new ResourceNotFoundException("File không tồn tại trên server");
        }
        return resource;
    }

    public String getFilename(Long docId) {
        return getOrThrow(docId).getFilename();
    }

    public void delete(Long docId, User user) throws IOException {
        Document doc = getOrThrow(docId);
        Files.deleteIfExists(Paths.get(doc.getStoredPath()));
        documentRepo.delete(doc);
    }

    private Document getOrThrow(Long id) {
        return documentRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài liệu id=" + id));
    }

    private boolean isPdf(MultipartFile file) {
        String name = file.getOriginalFilename();
        return name != null && name.toLowerCase().endsWith(".pdf");
    }
}
