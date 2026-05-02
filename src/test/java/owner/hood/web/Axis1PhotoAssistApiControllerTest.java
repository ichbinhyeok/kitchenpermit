package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import owner.hood.application.axis1.Axis1PhotoAssistService;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class Axis1PhotoAssistApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void photoAssistRejectsMissingPhotos() throws Exception {
        mockMvc.perform(post("/api/axis1/photo-assist")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"photos\":[]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(containsString("At least one photo")));
    }

    @Test
    void photoAssistRejectsExcessiveBatchSize() throws Exception {
        StringBuilder photos = new StringBuilder();
        photos.append("{\"photos\":[");

        for (int index = 0; index < 17; index++) {
            if (index > 0) {
                photos.append(',');
            }
            photos.append("{\"photoId\":\"p")
                    .append(index)
                    .append("\",\"fileName\":\"IMG_")
                    .append(index)
                    .append(".jpg\"}");
        }

        photos.append("]}");

        mockMvc.perform(post("/api/axis1/photo-assist")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(photos.toString()))
                .andExpect(status().isPayloadTooLarge())
                .andExpect(jsonPath("$.error").value(containsString("16 photos")));
    }

    @Test
    void photoAssistRejectsOversizedPreview() throws Exception {
        String payload = "{\"photos\":[{\"photoId\":\"p1\",\"fileName\":\"IMG_9001.jpg\",\"dataUrl\":\"data:image/jpeg;base64,"
                + "a".repeat(Axis1PhotoAssistService.MAX_DATA_URL_LENGTH + 1)
                + "\"}]}";

        mockMvc.perform(post("/api/axis1/photo-assist")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isPayloadTooLarge())
                .andExpect(jsonPath("$.error").value(containsString("too large")));
    }

    @Test
    void photoAssistReturnsMockSuggestionsByDefault() throws Exception {
        mockMvc.perform(post("/api/axis1/photo-assist")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "photos": [
                                    {
                                      "photoId": "hood-after-1",
                                      "fileName": "hood-after-clean.jpg"
                                    }
                                  ]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.mode").value("mock"))
                .andExpect(jsonPath("$.provider").value("mock"))
                .andExpect(jsonPath("$.model").value("mock-rule-fallback"))
                .andExpect(jsonPath("$.suggestions[0].photoId").value("hood-after-1"))
                .andExpect(jsonPath("$.suggestions[0].suggestedSlotId").value("hood-after"))
                .andExpect(jsonPath("$.suggestions[0].vendorDecision").value("pending"));
    }
}
