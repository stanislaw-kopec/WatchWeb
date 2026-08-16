package com.watchweb.app;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class ReviewSecurityIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void rejectsCreatingReviewWithoutAuthentication() throws Exception {
        var watch = saveCatalogWatch("Security", "Locked Review");

        mockMvc.perform(post("/api/watches/{watchId}/reviews", watch.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "rating": 8,
                                  "content": "Should require authentication."
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }
}
