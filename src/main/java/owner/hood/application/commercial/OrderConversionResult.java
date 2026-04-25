package owner.hood.application.commercial;

import java.util.UUID;

public record OrderConversionResult(
        UUID leadId,
        UUID orderId,
        String orderNumber
) {
}
