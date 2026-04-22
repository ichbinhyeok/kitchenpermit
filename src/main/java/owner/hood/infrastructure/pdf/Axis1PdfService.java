package owner.hood.infrastructure.pdf;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;
import owner.hood.application.axis1.Axis1BriefFindingView;
import owner.hood.application.axis1.Axis1BriefView;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class Axis1PdfService {

    public byte[] render(Axis1BriefView brief) {
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                content.beginText();
                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
                content.newLineAtOffset(48, 740);
                content.showText(brief.vendorBrandName() + " Service Completion Brief");
                content.endText();

                content.beginText();
                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                content.newLineAtOffset(48, 710);
                content.setLeading(16);
                content.showText("Customer: " + brief.customerName());
                content.newLine();
                content.showText("Site: " + brief.siteName() + " | " + brief.siteAddress());
                content.newLine();
                content.showText("Service date: " + brief.serviceDateText());
                content.newLine();
                content.showText("Crew: " + defaultText(brief.crewLabel()));
                content.newLine();
                content.showText("Summary: " + brief.serviceSummary());
                content.newLine();
                if (brief.nextRecommendedServiceDate() != null) {
                    content.showText("Next recommended service: " + brief.nextRecommendedServiceDateText());
                    content.newLine();
                }
                content.showText("Contact: " + brief.vendorPrimaryContactName() + " | " + defaultText(brief.vendorPhone()));
                content.newLine();
                content.showText("Reply: " + brief.vendorReplyEmail());
                int findingIndex = 1;
                for (Axis1BriefFindingView finding : brief.findings()) {
                    content.newLine();
                    content.showText("Finding " + findingIndex + " [" + finding.severity() + "]: " + finding.summary());
                    if (finding.recommendedAction() != null && !finding.recommendedAction().isBlank()) {
                        content.newLine();
                        content.showText("Recommended action: " + finding.recommendedAction());
                    }
                    findingIndex++;
                }
                content.endText();
            }

            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to generate Axis 1 PDF", exception);
        }
    }

    private String defaultText(String value) {
        return value == null || value.isBlank() ? "Not supplied" : value;
    }
}
