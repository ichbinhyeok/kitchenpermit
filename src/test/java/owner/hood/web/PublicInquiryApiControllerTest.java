package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import owner.hood.domain.commercial.CommercialLead;
import owner.hood.domain.commercial.CommercialLeadSourceType;
import owner.hood.domain.commercial.CommercialLeadStatus;
import owner.hood.infrastructure.persistence.CommercialLeadRepository;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PublicInquiryApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CommercialLeadRepository commercialLeadRepository;

    @Test
    void createInquiryPersistsPublicLeadAndReturnsCreatedPayload() throws Exception {
        String requestBody = """
                {
                  "companyName": "Austin Exhaust Co",
                  "contactName": "Jamie Rivera",
                  "email": "jamie@austinexhaust.example",
                  "phone": "512-555-0100",
                  "serviceArea": "Austin metro",
                  "productInterest": "Axis 2",
                  "notes": "Interested in a first paid batch."
                }
                """;

        mockMvc.perform(post("/api/public/inquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/public/inquiries/")))
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.companyName").value("Austin Exhaust Co"))
                .andExpect(jsonPath("$.contactName").value("Jamie Rivera"))
                .andExpect(jsonPath("$.email").value("jamie@austinexhaust.example"))
                .andExpect(jsonPath("$.phone").value("512-555-0100"))
                .andExpect(jsonPath("$.serviceArea").value("Austin metro"))
                .andExpect(jsonPath("$.productInterest").value("Axis 2"))
                .andExpect(jsonPath("$.notes").value("Interested in a first paid batch."))
                .andExpect(jsonPath("$.leadStatus").value("NEW"))
                .andExpect(jsonPath("$.emailDraftUrl", containsString("mailto:compliance@kitchenpermit.com")));
    }

    @Test
    void getInquiryLoadsExistingLead() throws Exception {
        CommercialLead lead = new CommercialLead();
        lead.setSourceType(CommercialLeadSourceType.PUBLIC_START_FORM);
        lead.setCompanyName("DFW Hood Vendor");
        lead.setContactName("Morgan Lee");
        lead.setEmail("morgan@dfwhood.example");
        lead.setPhone("214-555-0120");
        lead.setServiceAreaText("Dallas-Fort Worth");
        lead.setProductInterest("Axis 1 + Axis 2");
        lead.setLeadNotes("Needs bundle setup.");
        lead.setLeadStatus(CommercialLeadStatus.NEW);

        CommercialLead savedLead = commercialLeadRepository.save(lead);

        mockMvc.perform(get("/api/public/inquiries/{leadId}", savedLead.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedLead.getId().toString()))
                .andExpect(jsonPath("$.companyName").value("DFW Hood Vendor"))
                .andExpect(jsonPath("$.contactName").value("Morgan Lee"))
                .andExpect(jsonPath("$.email").value("morgan@dfwhood.example"))
                .andExpect(jsonPath("$.phone").value("214-555-0120"))
                .andExpect(jsonPath("$.serviceArea").value("Dallas-Fort Worth"))
                .andExpect(jsonPath("$.productInterest").value("Axis 1 + Axis 2"))
                .andExpect(jsonPath("$.notes").value("Needs bundle setup."))
                .andExpect(jsonPath("$.emailDraftUrl", containsString("DFW%20Hood%20Vendor")));
    }
}
