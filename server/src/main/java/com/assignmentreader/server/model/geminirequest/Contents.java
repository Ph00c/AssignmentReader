package com.assignmentreader.server.model.geminirequest;

import lombok.Data;

@Data
public class Contents {
    private String text;

    public Contents(String text) {
        this.text = text +
                "From these syllabi, extract all graded or scheduled academic deliverables and assessments: homework, assignments, projects, exams, quizzes, labs, presentations, final exams, and any explicitly dated assignment discussions or reviews tied to course work.\n\n" +
                        "Return ONLY a plain list of entries, one per line, pipe-separated, with exactly these 4 fields:\n" +
                        "Class | Assignment Name | Due Date | Additional Information\n\n" +
                        "Rules:\n" +
                        "- Class: use the course number or course name exactly as shown in the syllabus.\n" +
                        "- Assignment Name: use a short label such as HW1, Homework Assignments, Midterm 1, Final Exam, Course Project, Project, Assignment 1/2 Discussion.\n" +
                        "- Due Date: use the exact date text only if it is explicitly written in the syllabus.\n" +
                        "- If a syllabus gives only an assigned date and no due date, put that assigned date in Due Date and write \\\"assigned date only\\\" in Additional Information.\n" +
                        "- If a syllabus mentions an item but gives no explicit date, write N/A in Due Date and write \\\"no explicit date in syllabus\\\" in Additional Information.\n" +
                        "- If a syllabus gives only a relative time phrase such as \\\"last week of the semester\\\" and no exact date, write N/A in Due Date and preserve that phrase in Additional Information.\n" +
                        "- Do not infer, calculate, or invent dates from the university calendar.\n" +
                        "- Do not merge separate items unless the syllabus clearly groups them together.\n" +
                        "- Include weight if stated.\n" +
                        "- Include concise relevant notes such as topic coverage, section-specific timing, team/individual, or assigned-date-only.\n" +
                        "- For CSCE 314, weekly homework exists but individual exact due dates may not be present; include the homework items shown in the syllabus even if Due Date must be N/A.\n" +
                        "- For CS 4365, include homework assignments, course project, midterms, final exam, and any explicitly dated assignment discussion entries shown in the course schedule.\n" +
                        "- Preserve ambiguity rather than guessing.\n\n" +
                        "Ordering:\n" +
                        "- First group by class.\n" +
                        "- Within each class, list all entries that have explicit dates in chronological order.\n" +
                        "- After dated entries, list undated entries with Due Date = N/A.\n\n" +
                        "Output rules:\n" +
                        "- No markdown.\n" +
                        "- No bullets.\n" +
                        "- No headers.\n" +
                        "- No blank lines.\n" +
                        "- No commentary or explanation.\n" +
                        "- One entry per line only.\n\n" +
                        "   Replace N/A with No Specific Due Date"+
                        "Example format:\n" +
                        "CS 4390 | HW1 | 02/05 | HW - assigned 01/29, 15% total across 5 assignments\n" +
                        "CS 4390 | Exam I | 02/24 | EXAM - 20% of grade, covers weeks 1-5\n" +
                        "CS 4390 | Project | 04/30 | PROJECT - 20% of grade, team project using Java\n";
    }
}
