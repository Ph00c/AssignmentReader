package com.assignmentreader.server.service;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestClient;
import com.assignmentreader.server.model.geminirequest.GeminiRequest;
import com.assignmentreader.server.model.geminiresponse.GeminiResponse;

@Service
public class GeminiService {
    private final RestClient restClient;
    private final String apiKey;

    public GeminiService(RestClient.Builder builder, @Value("${gemini.api.key}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = builder
                .baseUrl("https://generativelanguage.googleapis.com")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public GeminiResponse generateContent(GeminiRequest request) {
        return restClient.post()
                .uri("/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey)
                .body(request)
                .retrieve()
                .body(GeminiResponse.class);
    }
}
