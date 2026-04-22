package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.axis2.OpportunityContact;

import java.util.List;
import java.util.UUID;

public interface OpportunityContactRepository extends JpaRepository<OpportunityContact, UUID> {

    List<OpportunityContact> findBySignalIdOrderByConfidenceScoreDescCreatedAtAsc(UUID signalId);
}
