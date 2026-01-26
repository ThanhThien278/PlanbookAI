package com.planbookai.question.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "questions")
@Data
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "JSON")
    private String options; // [{"id":"A","text":"Option A"}]

    private String correctOption; // "A"

    private String subject;
    private Integer gradeLevel;
    
    private Long creatorId;
    
    @Enumerated(EnumType.STRING)
    private QuestionStatus status;
    
    public enum QuestionStatus { DRAFT, PENDING, APPROVED }
}
