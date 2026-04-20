package com.assignmentreader.server.model.geminirequest;

import lombok.Data;
import java.util.List;

@Data
public class GeminiRequest {
    private List<RequestContent> contents;

    public GeminiRequest(List<RequestContent> contents) {
        this.contents = contents;
    }
}