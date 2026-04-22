package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.outbound.VendorProspect;

import java.util.List;
import java.util.UUID;

public interface VendorProspectRepository extends JpaRepository<VendorProspect, UUID> {

    List<VendorProspect> findAllByOrderByCreatedAtDesc();
}
