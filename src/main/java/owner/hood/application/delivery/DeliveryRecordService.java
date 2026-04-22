package owner.hood.application.delivery;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import owner.hood.domain.delivery.DeliveryRecord;
import owner.hood.domain.vendor.VendorOrganization;
import owner.hood.infrastructure.persistence.DeliveryRecordRepository;
import owner.hood.infrastructure.persistence.VendorOrganizationRepository;

import java.time.Instant;
import java.util.UUID;

@Service
public class DeliveryRecordService {

    private final DeliveryRecordRepository deliveryRecordRepository;
    private final VendorOrganizationRepository vendorOrganizationRepository;

    public DeliveryRecordService(
            DeliveryRecordRepository deliveryRecordRepository,
            VendorOrganizationRepository vendorOrganizationRepository
    ) {
        this.deliveryRecordRepository = deliveryRecordRepository;
        this.vendorOrganizationRepository = vendorOrganizationRepository;
    }

    @Transactional
    public void recordReadyDelivery(
            UUID vendorId,
            String productAxis,
            String artifactType,
            String deliveryChannel,
            String deliveredTo
    ) {
        VendorOrganization vendor = vendorOrganizationRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found: " + vendorId));

        DeliveryRecord record = new DeliveryRecord();
        record.setVendor(vendor);
        record.setProductAxis(productAxis);
        record.setArtifactType(artifactType);
        record.setDeliveryChannel(deliveryChannel);
        record.setDeliveredTo(deliveredTo);
        record.setDeliveredAt(Instant.now());
        record.setDeliveryStatus("READY");
        deliveryRecordRepository.save(record);
    }
}
