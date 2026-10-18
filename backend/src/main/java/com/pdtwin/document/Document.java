package com.pdtwin.document;

import com.pdtwin.classroom.Classroom;
import com.pdtwin.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @Column(nullable = false)
    private String filename;

    @Column(nullable = false)
    private String storedPath;

    @Column(nullable = false)
    @Builder.Default
    private String mimeType = "application/pdf";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
