package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.outbound.OutboundResultSnapshot;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OutboundResultSnapshotRepository extends JpaRepository<OutboundResultSnapshot, UUID> {

    List<OutboundResultSnapshot> findByCampaignIdOrderByAnalysisWindowEndDesc(UUID campaignId);

    Optional<OutboundResultSnapshot> findFirstByCampaignIdOrderByAnalysisWindowEndDesc(UUID campaignId);
}
