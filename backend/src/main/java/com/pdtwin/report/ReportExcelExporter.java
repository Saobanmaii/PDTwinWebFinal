package com.pdtwin.report;

import com.pdtwin.report.dto.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/** Dựng file .xlsx từ dữ liệu báo cáo */
@Component
public class ReportExcelExporter {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final int MAX_COL_WIDTH = 45 * 256; // trần bề rộng cột (đơn vị 1/256 ký tự)
    private static final int MIN_COL_WIDTH = 8 * 256;  // sàn, tránh cột quá hẹp khó đọc

    public byte[] exportSessionReport(SessionReportResponse report) throws IOException {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Ket qua bai thuc hanh");
            Styles st = new Styles(wb);

            String[] headers = {"STT", "Mã SV", "Họ và tên", "Trạng thái", "Điểm SV làm",
                                "Điểm GV chốt", "Điểm cuối", "Thời gian nộp", "Nhận xét của GV"};

            int r = writeTitle(sheet, st, headers.length,
                    "BẢNG ĐIỂM BÀI THỰC HÀNH",
                    "Bài: " + report.getPracticeTitle() + "   |   Lớp: " + report.getClassroomName());
            writeHeader(sheet, st, r++, headers);

            int stt = 1;
            for (SessionReportRow row : report.getRows()) {
                Row excelRow = sheet.createRow(r++);
                int c = 0;
                setCell(excelRow, c++, stt++, st.body);
                setCell(excelRow, c++, row.getStudentCode(), st.body);
                setCell(excelRow, c++, row.getStudentName(), st.body);
                setCell(excelRow, c++, statusLabel(row.getStatus()), st.body);
                setCell(excelRow, c++, row.getRawScore(), st.body);
                setCell(excelRow, c++, row.getFinalScore(), st.body);
                setCell(excelRow, c++, row.getEffectiveScore(), st.bodyBold);
                setCell(excelRow, c++, format(row.getCompletedAt()), st.body);
                setCell(excelRow, c, row.getFeedback(), st.bodyWrap);
            }

            // Căn cột TRƯỚC khi ghi dòng tổng kết, nếu không autoSizeColumn sẽ tính cả
            // chuỗi dài "Điểm trung bình: ..." ở cột STT và kéo cột đó rộng ra vô lý
            finish(sheet, headers.length);
            writeSummary(sheet, st, r + 1, report.getRows());
            wb.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportClassroomReport(ClassroomReportResponse report) throws IOException {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Bang diem lop");
            Styles st = new Styles(wb);

            List<ReportColumn> sessions = report.getSessions();
            int totalCols = 3 + sessions.size() + 2;

            int r = writeTitle(sheet, st, totalCols,
                    "BẢNG ĐIỂM TỔNG KẾT LỚP",
                    "Lớp: " + report.getClassroomName() + "   |   GV: " + report.getTeacherName());

            // Header: STT | Mã SV | Họ và tên | <từng bài> | Đã làm | Điểm TB
            Row header = sheet.createRow(r++);
            int c = 0;
            setCell(header, c++, "STT", st.header);
            setCell(header, c++, "Mã SV", st.header);
            setCell(header, c++, "Họ và tên", st.header);
            for (ReportColumn col : sessions) {
                setCell(header, c++, col.getPracticeTitle(), st.header);
            }
            setCell(header, c++, "Đã làm", st.header);
            setCell(header, c, "Điểm TB", st.header);

            int stt = 1;
            for (ClassroomReportRow row : report.getRows()) {
                Row excelRow = sheet.createRow(r++);
                c = 0;
                setCell(excelRow, c++, stt++, st.body);
                setCell(excelRow, c++, row.getStudentCode(), st.body);
                setCell(excelRow, c++, row.getStudentName(), st.body);
                for (Double v : row.getScores()) {
                    setCell(excelRow, c++, v, st.body);
                }
                setCell(excelRow, c++, row.getCompletedCount() + "/" + sessions.size(), st.body);
                setCell(excelRow, c, row.getAverage(), st.bodyBold);
            }

            finish(sheet, totalCols);
            wb.write(out);
            return out.toByteArray();
        }
    }

    // ─── helpers ─────────────────────────────────────────────────────────

    private int writeTitle(Sheet sheet, Styles st, int colCount, String title, String subtitle) {
        Row titleRow = sheet.createRow(0);
        setCell(titleRow, 0, title, st.title);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, Math.max(colCount - 1, 1)));

        Row subRow = sheet.createRow(1);
        setCell(subRow, 0, subtitle, st.subtitle);
        sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, Math.max(colCount - 1, 1)));

        Row metaRow = sheet.createRow(2);
        setCell(metaRow, 0, "Xuất lúc: " + format(LocalDateTime.now()), st.subtitle);
        sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, Math.max(colCount - 1, 1)));

        return 4; // chừa 1 dòng trống trước header
    }

    private void writeHeader(Sheet sheet, Styles st, int rowIdx, String[] headers) {
        Row header = sheet.createRow(rowIdx);
        for (int i = 0; i < headers.length; i++) {
            setCell(header, i, headers[i], st.header);
        }
    }

    private void writeSummary(Sheet sheet, Styles st, int rowIdx, List<SessionReportRow> rows) {
        long done = rows.stream().filter(r -> r.getEffectiveScore() != null).count();
        double avg = rows.stream().filter(r -> r.getEffectiveScore() != null)
                .mapToDouble(SessionReportRow::getEffectiveScore).average().orElse(0);

        Row r1 = sheet.createRow(rowIdx);
        setCell(r1, 0, "Đã làm: " + done + "/" + rows.size(), st.bodyBold);
        Row r2 = sheet.createRow(rowIdx + 1);
        setCell(r2, 0, "Điểm trung bình: " + (done > 0 ? String.format("%.2f", avg) : "—"), st.bodyBold);
    }

    private void finish(Sheet sheet, int colCount) {
        for (int i = 0; i < colCount; i++) {
            sheet.autoSizeColumn(i);
            int width = sheet.getColumnWidth(i);
            if (width > MAX_COL_WIDTH) sheet.setColumnWidth(i, MAX_COL_WIDTH);
            else if (width < MIN_COL_WIDTH) sheet.setColumnWidth(i, MIN_COL_WIDTH);
        }
        sheet.createFreezePane(0, 5); // khóa phần tiêu đề + header khi cuộn
    }

    private void setCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }

    private void setCell(Row row, int col, Double value, CellStyle style) {
        Cell cell = row.createCell(col);
        if (value != null) cell.setCellValue(value); else cell.setCellValue("—");
        cell.setCellStyle(style);
    }

    private void setCell(Row row, int col, int value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private String format(LocalDateTime dt) {
        return dt != null ? dt.format(DATE_FMT) : "";
    }

    private String statusLabel(String status) {
        return switch (status) {
            case "COMPLETED" -> "Đã làm";
            case "AVAILABLE" -> "Chưa làm (đang mở)";
            case "NOT_YET" -> "Chưa đến giờ";
            case "EXPIRED" -> "Hết hạn - không làm";
            case "NOT_SCHEDULED" -> "Chưa phân lịch";
            default -> status;
        };
    }

    /** Gom các CellStyle dùng lại, tránh tạo mới cho từng ô (POI giới hạn số style) */
    private static class Styles {
        final CellStyle title, subtitle, header, body, bodyBold, bodyWrap;

        Styles(Workbook wb) {
            Font titleFont = wb.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);

            Font headerFont = wb.createFont();
            headerFont.setBold(true);

            Font boldFont = wb.createFont();
            boldFont.setBold(true);

            title = wb.createCellStyle();
            title.setFont(titleFont);
            title.setAlignment(HorizontalAlignment.CENTER);

            subtitle = wb.createCellStyle();
            subtitle.setAlignment(HorizontalAlignment.CENTER);

            header = wb.createCellStyle();
            header.setFont(headerFont);
            header.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            header.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            header.setAlignment(HorizontalAlignment.CENTER);
            border(header);

            body = wb.createCellStyle();
            border(body);

            bodyBold = wb.createCellStyle();
            bodyBold.setFont(boldFont);
            border(bodyBold);

            bodyWrap = wb.createCellStyle();
            bodyWrap.setWrapText(true);
            border(bodyWrap);
        }

        private void border(CellStyle s) {
            s.setBorderTop(BorderStyle.THIN);
            s.setBorderBottom(BorderStyle.THIN);
            s.setBorderLeft(BorderStyle.THIN);
            s.setBorderRight(BorderStyle.THIN);
        }
    }
}
