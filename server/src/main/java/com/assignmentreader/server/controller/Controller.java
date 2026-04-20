package com.assignmentreader.server.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import com.assignmentreader.server.service.GeminiService;
import com.assignmentreader.server.model.geminirequest.GeminiRequest;
import com.assignmentreader.server.model.geminirequest.RequestContent;
import com.assignmentreader.server.model.geminirequest.Contents;
import com.assignmentreader.server.model.geminiresponse.GeminiResponse;
import com.assignmentreader.server.dto.ParsedAssignment;
import com.assignmentreader.server.repository.ParsedAssignmentRepository;
import java.util.List;

@RestController
@RequestMapping("/api")
public class Controller {
    @Autowired
    private GeminiService geminiService;

    @Autowired
    private ParsedAssignmentRepository parsedAssignmentRepository;

    @PostMapping("/parse")
    public String parse(@RequestBody String text) {
        // Build the Gemini request
        RequestContent content = new RequestContent(null, List.of(new Contents(text)));
        GeminiRequest request = new GeminiRequest(List.of(content));

        // Call the service
        GeminiResponse response = geminiService.generateContent(request);

        // Extract the response text
        String parsedText = "No response generated";
        if (response.getCandidates() != null && !response.getCandidates().isEmpty()) {
            parsedText = response.getCandidates().getFirst().getContent().getParts().getFirst().getText();
        }

        // Store in database
        ParsedAssignment parsedAssignment = new ParsedAssignment(text, parsedText);
        parsedAssignmentRepository.save(parsedAssignment);

        return parsedText;
    }
}
