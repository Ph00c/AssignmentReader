package com.assignmentreader.server.model.geminiresponse;

import lombok.Data;
import java.util.List;

@Data
public class Content {
    private List<Part> parts;
}
