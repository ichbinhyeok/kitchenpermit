package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.commercial.CommercialLead;
import owner.hood.domain.commercial.CommercialLeadStatus;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface CommercialLeadRepository extends JpaRepository<CommercialLead, UUID> {

    long countByLeadStatus(CommercialLeadStatus leadStatus);

    List<CommercialLead> findAllByLeadStatusInOrderByCreatedAtDesc(Collection<CommercialLeadStatus> leadStatuses);
}
