package com.pdtwin.config;

import com.pdtwin.practice.PracticeSessionRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@RestController
@RequestMapping("/api/proxy")
@RequiredArgsConstructor
public class ProxyController {

    private final PracticeSessionRepository practiceSessionRepo;

    // Camera mặc định, dùng khi bài thực hành chưa cấu hình cameraUrl riêng
    @Value("${app.camera.url:}")
    private String defaultCameraUrl;

    @GetMapping("/camera")
    public void proxyCamera(
            @RequestParam(required = false) Long practiceSessionId,
            HttpServletResponse response) throws Exception {

        String targetUrl = defaultCameraUrl;
        if (practiceSessionId != null) {
            targetUrl = practiceSessionRepo.findById(practiceSessionId)
                    .map(ps -> ps.getCameraUrl() != null && !ps.getCameraUrl().isBlank()
                            ? ps.getCameraUrl() : defaultCameraUrl)
                    .orElse(defaultCameraUrl);
        }

        // Cộng thêm mốc thời gian thực tế để tránh cache ảnh cũ
        String freshUrl = targetUrl + "?t=" + System.currentTimeMillis();

        HttpURLConnection conn = (HttpURLConnection) new URL(freshUrl).openConnection();
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(0);
        conn.connect();

        response.setContentType(conn.getContentType() != null ? conn.getContentType() : "image/jpeg");
        try (InputStream in = conn.getInputStream()) {
            in.transferTo(response.getOutputStream());
        }
    }
}