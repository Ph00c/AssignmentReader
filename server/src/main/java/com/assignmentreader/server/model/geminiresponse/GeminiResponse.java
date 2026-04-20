package com.assignmentreader.server.model.geminiresponse;

import lombok.Data;
import java.util.List;

@Data
public class GeminiResponse {
    private List<Candidate> candidates;

    public GeminiResponse(List<Candidate> candidates) {
        this.candidates = candidates;
    }
}
