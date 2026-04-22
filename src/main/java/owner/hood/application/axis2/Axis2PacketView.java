package owner.hood.application.axis2;

import java.util.List;

public record Axis2PacketView(
        String token,
        String vendorBrandName,
        String vendorPrimaryContactName,
        String vendorReplyEmail,
        String vendorPhone,
        String targetMetroScope,
        String batchTypeLabel,
        int actualSize,
        String listExportPath,
        String packetIntro,
        String vendorCtaBlock,
        List<Axis2PacketItemView> items
) {
}
