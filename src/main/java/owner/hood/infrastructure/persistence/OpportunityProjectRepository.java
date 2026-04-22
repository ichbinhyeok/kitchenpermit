package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.axis2.OpportunityEligibilityStatus;
import owner.hood.domain.axis2.OpportunityProject;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OpportunityProjectRepository extends JpaRepository<OpportunityProject, UUID> {

    Optional<OpportunityProject> findByDedupeKey(String dedupeKey);

    List<OpportunityProject> findAllByOrderByCreatedAtDesc();

    List<OpportunityProject> findByMetroKeyAndEligibilityStatusOrderByFinalScoreDescLastSeenTriggerDateDesc(
            String metroKey,
            OpportunityEligibilityStatus eligibilityStatus
    );
}
