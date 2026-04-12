package com.assignmentreader.server.model.geminirequest;

import lombok.Data;

@Data
public class Contents {
    private String text;

    public Contents(String text) {
        this.text = text;
    }
}
