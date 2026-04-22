package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.axis2.OpportunitySignal;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OpportunitySignalRepository extends JpaRepository<OpportunitySignal, UUID> {

    List<OpportunitySignal> findByProjectIdOrderByFinalScoreDescTriggerDateDesc(UUID projectId);

    Optional<OpportunitySignal> findFirstByProjectIdOrderByFinalScoreDescTriggerDateDesc(UUID projectId);
}
