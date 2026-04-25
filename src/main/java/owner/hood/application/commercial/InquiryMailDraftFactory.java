package owner.hood.application.commercial;

import org.springframework.stereotype.Component;
import owner.hood.config.HoodSiteProperties;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class InquiryMailDraftFactory {

    private final HoodSiteProperties siteProperties;

    public InquiryMailDraftFactory(HoodSiteProperties siteProperties) {
        this.siteProperties = siteProperties;
    }

    public String buildDraftUrl(
            String companyName,
            String contactName,
            String email,
            String productInterest,
            String serviceArea,
            String phone,
            String notes
    ) {
        String subject = firstNonBlank(productInterest, "Project request")
                + " request"
                + (hasText(companyName) ? " - " + companyName : "");

        String body = "Kitchen Permit team,\r\n\r\n"
                + "I want to discuss " + firstNonBlank(productInterest, "a project") + ".\r\n\r\n"
                + "Company: " + firstNonBlank(companyName, "Not provided") + "\r\n"
                + "Primary contact: " + firstNonBlank(contactName, "Not provided") + "\r\n"
                + "Email: " + firstNonBlank(email, "Not provided") + "\r\n"
                + "Phone: " + firstNonBlank(phone, "Not provided") + "\r\n"
                + "Service area: " + firstNonBlank(serviceArea, "Not provided") + "\r\n\r\n"
                + "Notes:\r\n"
                + firstNonBlank(notes, "");

        return "mailto:" + siteProperties.getSupportEmail()
                + "?subject=" + encode(subject)
                + "&body=" + encode(body);
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String firstNonBlank(String primary, String fallback) {
        return hasText(primary) ? primary.trim() : fallback;
    }
}
