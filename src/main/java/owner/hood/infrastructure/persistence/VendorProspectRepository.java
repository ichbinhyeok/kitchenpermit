package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.outbound.ProspectStatus;
import owner.hood.domain.outbound.VendorProspect;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VendorProspectRepository extends JpaRepository<VendorProspect, UUID> {

    List<VendorProspect> findAllByOrderByCreatedAtDesc();

    List<VendorProspect> findAllByProspectStatusOrderByCreatedAtDesc(ProspectStatus prospectStatus);

    Optional<VendorProspect> findFirstByDisplayNameIgnoreCase(String displayName);

    Optional<VendorProspect> findFirstByWebsiteUrlIgnoreCase(String websiteUrl);

    Optional<VendorProspect> findFirstBySourceUrlIgnoreCase(String sourceUrl);
}
