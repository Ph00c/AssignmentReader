package com.assignmentreader.server.model.geminiresponse;

import java.util.List;

public class GeminiResponse {
    private List<Canidates> canidateslist;

    public GeminiResponse(Content content) {
        this.content = content;
    }
}
