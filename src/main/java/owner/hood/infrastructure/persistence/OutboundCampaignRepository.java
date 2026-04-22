package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.outbound.OutboundCampaign;

import java.util.List;
import java.util.UUID;

public interface OutboundCampaignRepository extends JpaRepository<OutboundCampaign, UUID> {

    List<OutboundCampaign> findAllByOrderByCreatedAtDesc();
}
