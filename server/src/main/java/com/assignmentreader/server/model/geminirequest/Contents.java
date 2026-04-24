package com.assignmentreader.server.model.geminirequest;

import lombok.Data;

@Data
public class Contents {
    private String text;

    public Contents(String text) {
        this.text = text +  "\n\nFrom this syllabus, extract every assignment, exam, project, and deadline." +
                " Return ONLY a plain list of entries, one per line, pipe-separated, with exactly these 4 fields:" +
                " Class | Assignment Name | Due Date | Additional Information" +
                "\n\nRules:" +
                "\n- Class: the course name or number (e.g. CS 4390)" +
                "\n- Assignment Name: short label (e.g. HW1, Exam I, Project)" +
                "\n- Due Date: exact date from the syllabus (e.g. 02/05) — if only an assigned date exists and no due date, write the assigned date and note it in Additional Information" +
                "\n- Additional Information: type (HW/EXAM/PROJECT), weight if graded, any relevant notes (e.g. HW - 15% total, 5 assignments | EXAM - 20% of grade | PROJECT - team project, Java)" +
                "\n- Do NOT include markdown, bullet points, headers, blank lines, or any explanation" +
                "\n- Do NOT skip any assignment, exam, or project" +
                "\n\nExample output format:" +
                "\nCS 4390 | HW1 | 02/05 | HW - assigned 01/29, 15% total across 5 assignments" +
                "\nCS 4390 | Exam I | 02/24 | EXAM - 20% of grade, covers weeks 1-5" +
                "\nCS 4390 | Project | 04/30 | PROJECT - 20% of grade, team project using Java";;
    }
}
