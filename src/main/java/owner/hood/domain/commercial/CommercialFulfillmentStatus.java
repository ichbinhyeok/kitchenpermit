package owner.hood.domain.commercial;

public enum CommercialFulfillmentStatus {
    NOT_STARTED,
    BLOCKED_VENDOR_SETUP,
    BLOCKED_INVENTORY_OR_QA,
    BUILDING,
    REVIEW_READY,
    SEND_READY,
    SENT
}
