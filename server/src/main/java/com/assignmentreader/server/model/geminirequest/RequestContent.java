package com.assignmentreader.server.model.geminirequest;

import lombok.Data;
import java.util.List;

@Data
public class RequestContent {
    private String role;
    private List<Contents> parts;

    public RequestContent(String role, List<Contents> parts) {
        this.role = role;
        this.parts = parts;
    }
}
