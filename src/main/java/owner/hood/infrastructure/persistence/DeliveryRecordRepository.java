package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.delivery.DeliveryRecord;

import java.util.UUID;

public interface DeliveryRecordRepository extends JpaRepository<DeliveryRecord, UUID> {
}
