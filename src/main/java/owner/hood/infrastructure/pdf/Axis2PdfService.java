package owner.hood.infrastructure.pdf;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;
import owner.hood.application.axis2.Axis2PacketItemView;
import owner.hood.application.axis2.Axis2PacketView;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class Axis2PdfService {

    public byte[] render(Axis2PacketView packet) {
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                content.beginText();
                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
                content.newLineAtOffset(48, 740);
                content.showText(packet.vendorBrandName() + " Axis 2 Opportunity Batch");
                content.endText();

                content.beginText();
                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                content.newLineAtOffset(48, 708);
                content.setLeading(16);
                content.showText("Batch: " + packet.batchTypeLabel());
                content.newLine();
                content.showText("Metro: " + packet.targetMetroScope());
                content.newLine();
                content.showText("Reply: " + packet.vendorReplyEmail() + " | " + packet.vendorPhone());
                content.newLine();
                content.showText(packet.packetIntro());
                int index = 1;
                for (Axis2PacketItemView item : packet.items()) {
                    content.newLine();
                    content.showText(index + ". " + item.businessName() + " | " + item.triggerType() + " | " + item.sourceName() + " | score " + item.finalScore());
                    content.newLine();
                    content.showText("   " + item.contactLadder());
                    index++;
                }
                content.endText();
            }

            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to generate Axis 2 PDF", exception);
        }
    }
}
