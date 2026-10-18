package com.pdtwin.report;

import com.pdtwin.common.ApiResponse;
import com.pdtwin.report.dto.ClassroomReportResponse;
import com.pdtwin.report.dto.SessionReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.text.Normalizer;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
public class ReportController {

    private static final String XLSX_MIME =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private final ReportService reportService;
    private final ReportExcelExporter excelExporter;

    @GetMapping("/class-sessions/{classSessionId}")
    public ApiResponse<SessionReportResponse> sessionReport(@PathVariable Long classSessionId) {
        return ApiResponse.ok(reportService.sessionReport(classSessionId));
    }

    @GetMapping("/classrooms/{classroomId}")
    public ApiResponse<ClassroomReportResponse> classroomReport(@PathVariable Long classroomId) {
        return ApiResponse.ok(reportService.classroomReport(classroomId));
    }

    @GetMapping("/class-sessions/{classSessionId}/export")
    public ResponseEntity<Resource> exportSession(@PathVariable Long classSessionId) throws IOException {
        SessionReportResponse report = reportService.sessionReport(classSessionId);
        byte[] bytes = excelExporter.exportSessionReport(report);
        String filename = "BangDiem_" + slug(report.getClassroomName())
                + "_" + slug(report.getPracticeTitle()) + "_" + LocalDate.now() + ".xlsx";
        return xlsxResponse(bytes, filename);
    }

    @GetMapping("/classrooms/{classroomId}/export")
    public ResponseEntity<Resource> exportClassroom(@PathVariable Long classroomId) throws IOException {
        ClassroomReportResponse report = reportService.classroomReport(classroomId);
        byte[] bytes = excelExporter.exportClassroomReport(report);
        String filename = "BangDiemTongKet_" + slug(report.getClassroomName())
                + "_" + LocalDate.now() + ".xlsx";
        return xlsxResponse(bytes, filename);
    }

    private ResponseEntity<Resource> xlsxResponse(byte[] bytes, String filename) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(XLSX_MIME))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentLength(bytes.length)
                .body(new ByteArrayResource(bytes));
    }

    /** Bỏ dấu tiếng Việt + ký tự lạ để tên file an toàn trên mọi hệ điều hành/trình duyệt */
    private String slug(String input) {
        if (input == null || input.isBlank()) return "khong-ten";
        String noAccent = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace('đ', 'd').replace('Đ', 'D');
        return noAccent.replaceAll("[^a-zA-Z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
