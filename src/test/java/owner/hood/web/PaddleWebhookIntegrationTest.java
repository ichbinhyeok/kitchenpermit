package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import owner.hood.infrastructure.persistence.AccountUserRepository;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "hood.billing.provider=paddle",
        "hood.billing.paddle.company-price-id=pri_test_company",
        "hood.billing.paddle.webhook-secret=pdl_ntfset_test_secret",
        "hood.billing.paddle.webhook-tolerance-seconds=300"
})
@AutoConfigureMockMvc
class PaddleWebhookIntegrationTest {

    private static final String WEBHOOK_SECRET = "pdl_ntfset_test_secret";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AccountUserRepository accountUsers;

    @Test
    void paidPaddleWebhookUnlocksCompanyEntitlement() throws Exception {
        String email = "paid-" + UUID.randomUUID() + "@example.com";
        MockHttpSession session = signupSession(email);

        mockMvc.perform(get("/api/account/entitlements").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.billingProvider").value("paddle"))
                .andExpect(jsonPath("$.companyAccess").value(false))
                .andExpect(jsonPath("$.billingStatus").value("login_no_subscription"));

        String payload = transactionCompletedPayload(email);

        mockMvc.perform(post("/api/billing/paddle/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Paddle-Signature", signature(payload))
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.action").value("activated"))
                .andExpect(jsonPath("$.accountEmail").value(email))
                .andExpect(jsonPath("$.subscriptionId").value("sub_01testcompanysubscription"))
                .andExpect(jsonPath("$.status").value("active"));

        mockMvc.perform(get("/api/account/entitlements").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.billingProvider").value("paddle"))
                .andExpect(jsonPath("$.companyAccess").value(true))
                .andExpect(jsonPath("$.billingStatus").value("active_subscription"));

        mockMvc.perform(put("/api/account/company-profile")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(companyProfilePayload()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Paid Hood Co."));

        mockMvc.perform(post("/api/axis1/reports")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportPayload("company")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productPlan").value("company"))
                .andExpect(jsonPath("$.payload.productPlan").value("company"))
                .andExpect(jsonPath("$.retention.policy").value("company_retained_link"));

        mockMvc.perform(get("/api/axis1/reports/history").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productPlan").value("company"))
                .andExpect(jsonPath("$[0].pdfExport.serverDownloadReady").value(true));
    }

    @Test
    void canceledPaddleSubscriptionKeepsExistingCompanyReportLinksAndAssets() throws Exception {
        String email = "cancel-" + UUID.randomUUID() + "@example.com";
        String subscriptionId = "sub_" + UUID.randomUUID().toString().replace("-", "");
        MockHttpSession session = signupSession(email);

        String activationPayload = transactionCompletedPayload(email, subscriptionId);
        mockMvc.perform(post("/api/billing/paddle/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Paddle-Signature", signature(activationPayload))
                        .content(activationPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("active"));

        MvcResult savedResult = mockMvc.perform(post("/api/axis1/reports")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportPayload("company")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productPlan").value("company"))
                .andReturn();

        String savedJson = savedResult.getResponse().getContentAsString();
        String publicId = com.jayway.jsonpath.JsonPath.read(savedJson, "$.publicId");
        String pdfHref = com.jayway.jsonpath.JsonPath.read(savedJson, "$.pdfExport.downloadHref");

        mockMvc.perform(get("/api/axis1/reports/public/{publicId}", publicId))
                .andExpect(status().isOk());

        String canceledPayload = subscriptionCanceledPayload(subscriptionId);
        mockMvc.perform(post("/api/billing/paddle/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Paddle-Signature", signature(canceledPayload))
                        .content(canceledPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("canceled"));

        mockMvc.perform(get("/api/account/entitlements").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyAccess").value(false));

        mockMvc.perform(get("/api/axis1/reports/public/{publicId}", publicId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productPlan").value("company"))
                .andExpect(jsonPath("$.retention.policy").value("company_retained_link"));

        mockMvc.perform(get("/api/axis1/reports/public/{publicId}/pdf-manifest", publicId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pdfExport.serverDownloadReady").value(true));

        mockMvc.perform(get(pdfHref))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/axis1/reports/history").session(session))
                .andExpect(status().is(402))
                .andExpect(jsonPath("$[0].companyAccessRequired").value(true));
    }

    @Test
    void loginWithoutSubscriptionDoesNotUnlockCompanyStorageOrHistory() throws Exception {
        String email = "unpaid-" + UUID.randomUUID() + "@example.com";
        MockHttpSession session = signupSession(email);

        mockMvc.perform(put("/api/account/company-profile")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(companyProfilePayload()))
                .andExpect(status().is(402))
                .andExpect(jsonPath("$.companyAccessRequired").value(true));

        mockMvc.perform(post("/api/axis1/reports")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportPayload("company")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productPlan").value("free"))
                .andExpect(jsonPath("$.payload.productPlan").value("free"))
                .andExpect(jsonPath("$.retention.policy").value("free_7_day_link"));

        mockMvc.perform(get("/api/axis1/reports/history").session(session))
                .andExpect(status().is(402))
                .andExpect(jsonPath("$[0].companyAccessRequired").value(true));
    }

    @Test
    void invalidPaddleWebhookSignatureIsRejected() throws Exception {
        mockMvc.perform(post("/api/billing/paddle/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Paddle-Signature", "ts=1;h1=bad")
                        .content(transactionCompletedPayload("bad-" + UUID.randomUUID() + "@example.com")))
                .andExpect(status().isUnauthorized());
    }

    private MockHttpSession signupSession(String email) throws Exception {
        MvcResult signup = mockMvc.perform(post("/auth/signup")
                        .param("email", email)
                        .param("password", "correct-horse-1")
                        .param("confirmPassword", "correct-horse-1")
                        .param("next", "/dashboard"))
                .andExpect(status().is3xxRedirection())
                .andReturn();

        var account = accountUsers.findByEmail(email).orElseThrow();
        account.setEmailVerified(true);
        account.setEmailVerifiedAt(Instant.now());
        accountUsers.save(account);

        return (MockHttpSession) signup.getRequest().getSession(false);
    }

    private String transactionCompletedPayload(String email) {
        return transactionCompletedPayload(email, "sub_01testcompanysubscription");
    }

    private String transactionCompletedPayload(String email, String subscriptionId) {
        return """
                {
                  "event_id": "evt_%s",
                  "event_type": "transaction.completed",
                  "occurred_at": "2026-05-13T09:00:00Z",
                  "notification_id": "ntf_01test",
                  "data": {
                    "id": "txn_01testcompanytransaction",
                    "status": "completed",
                    "customer_id": "ctm_01testcustomer",
                    "subscription_id": "%s",
                    "billing_period": {
                      "starts_at": "2026-05-13T09:00:00Z",
                      "ends_at": "2026-06-13T09:00:00Z"
                    },
                    "custom_data": {
                      "hood_product": "axis1_company_version",
                      "hood_account_email": "%s"
                    },
                    "items": [
                      {
                        "price": {
                          "id": "pri_test_company"
                        },
                        "quantity": 1
                      }
                    ]
                  }
                }
                """.formatted(UUID.randomUUID().toString().replace("-", ""), subscriptionId, email);
    }

    private String subscriptionCanceledPayload(String subscriptionId) {
        return """
                {
                  "event_id": "evt_%s",
                  "event_type": "subscription.canceled",
                  "occurred_at": "2026-05-14T09:00:00Z",
                  "notification_id": "ntf_01cancel",
                  "data": {
                    "id": "%s",
                    "status": "canceled",
                    "customer_id": "ctm_01testcustomer",
                    "current_billing_period": {
                      "starts_at": "2026-05-13T09:00:00Z",
                      "ends_at": "2026-06-13T09:00:00Z"
                    },
                    "items": [
                      {
                        "price": {
                          "id": "pri_test_company"
                        }
                      }
                    ]
                  }
                }
                """.formatted(UUID.randomUUID().toString().replace("-", ""), subscriptionId);
    }

    private String companyProfilePayload() {
        return """
                {
                  "companyName": "Paid Hood Co.",
                  "serviceArea": "Austin, TX",
                  "directLine": "(512) 555-0100",
                  "dispatchEmail": "dispatch@paidhood.example",
                  "afterHoursPhone": "(512) 555-0199",
                  "certification": "NFPA 96 service record",
                  "technicianLabel": "Night crew",
                  "brandInitials": "PH"
                }
                """;
    }

    private String reportPayload(String productPlan) {
        return """
                {
                  "productPlan": "%s",
                  "values": {
                    "propertyName": "Paid Test Diner",
                    "systemName": "Main cookline hood",
                    "siteCity": "Austin, TX",
                    "serviceDate": "2026-05-13",
                    "cadence": "90"
                  },
                  "uploadedFieldPhotos": {},
                  "photoSlotResolutions": {},
                  "links": {},
                  "presentationMode": "standard",
                  "visibleSections": {
                    "photos": true,
                    "checklist": true,
                    "routeDetail": true,
                    "nextService": true
                  }
                }
                """.formatted(productPlan);
    }

    private String signature(String payload) throws Exception {
        String timestamp = Long.toString(Instant.now().getEpochSecond());
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(WEBHOOK_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String signedPayload = timestamp + ":" + payload;
        String digest = HexFormat.of().formatHex(mac.doFinal(signedPayload.getBytes(StandardCharsets.UTF_8)));

        if (!MessageDigest.isEqual(digest.getBytes(StandardCharsets.UTF_8), digest.getBytes(StandardCharsets.UTF_8))) {
            throw new IllegalStateException("unreachable");
        }

        return "ts=" + timestamp + ";h1=" + digest;
    }
}
