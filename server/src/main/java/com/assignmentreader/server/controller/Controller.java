package com.assignmentreader.server.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.assignmentreader.server.service.GeminiService;
import com.assignmentreader.server.service.ExcelService;
import com.assignmentreader.server.model.geminirequest.GeminiRequest;
import com.assignmentreader.server.model.geminirequest.RequestContent;
import com.assignmentreader.server.model.geminirequest.Contents;
import com.assignmentreader.server.model.geminiresponse.GeminiResponse;
import com.assignmentreader.server.dto.ParsedAssignment;
import com.assignmentreader.server.repository.ParsedAssignmentRepository;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/")
public class Controller {
    @Autowired
    private GeminiService geminiService;

    @Autowired
    private ExcelService excelService;

    @Autowired
    private ParsedAssignmentRepository parsedAssignmentRepository;

    @PostMapping("/SyllabusParser")
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

    @PostMapping("/Excel")
    public ResponseEntity<byte[]> createExcel(@RequestBody String text) throws IOException {
        // Parse the syllabus
        String result = parse(text);
        
        // Generate Excel file
        byte[] excelFile = excelService.generateExcelFromParsedText(result);
        
        // Set headers for file download
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "ParsedSyllabus.xlsx");
        headers.setContentLength(excelFile.length);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(excelFile);
    }
}
