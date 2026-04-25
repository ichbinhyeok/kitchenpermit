package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.commercial.CommercialOrder;
import owner.hood.domain.commercial.CommercialOrderStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommercialOrderRepository extends JpaRepository<CommercialOrder, UUID> {

    List<CommercialOrder> findAllByOrderByUpdatedAtDesc();

    long countByOrderStatus(CommercialOrderStatus orderStatus);

    Optional<CommercialOrder> findFirstByLeadIdOrderByCreatedAtDesc(UUID leadId);
}
