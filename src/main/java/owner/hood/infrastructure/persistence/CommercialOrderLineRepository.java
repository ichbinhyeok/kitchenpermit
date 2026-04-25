package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.commercial.CommercialOrderLine;

import java.util.List;
import java.util.UUID;

public interface CommercialOrderLineRepository extends JpaRepository<CommercialOrderLine, UUID> {

    List<CommercialOrderLine> findByOrderIdOrderByCreatedAtAsc(UUID orderId);
}
