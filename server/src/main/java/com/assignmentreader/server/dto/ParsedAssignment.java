package com.assignmentreader.server.dto;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class ParsedAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(columnDefinition = "TEXT")
    private String originalText;
    @Column(columnDefinition = "TEXT")
    private String parsedText;
    private LocalDateTime createdAt;

    // Default constructor
    public ParsedAssignment() {}

    // Constructor
    public ParsedAssignment(String originalText, String parsedText) {
        this.originalText = originalText;
        this.parsedText = parsedText;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOriginalText() {
        return originalText;
    }

    public void setOriginalText(String originalText) {
        this.originalText = originalText;
    }

    public String getParsedText() {
        return parsedText;
    }

    public void setParsedText(String parsedText) {
        this.parsedText = parsedText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
