package com.pdtwin.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.unity.dir:}")
    private String unityDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("http://localhost:*", "http://203.162.88.113")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path unityBuildsPath;
        if (unityDir != null && !unityDir.isBlank()) {
            unityBuildsPath = Paths.get(unityDir).normalize();
        } else {
            unityBuildsPath = Paths.get(System.getProperty("user.dir"))
                    .resolve("../unity-builds")
                    .normalize();
        }
        String location = unityBuildsPath.toUri().toString();
        if (!location.endsWith("/")) location += "/";

        registry.addResourceHandler("/unity/**")
                .addResourceLocations(location);
    }
}
