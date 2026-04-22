package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.vendor.VendorOrganization;

import java.util.List;
import java.util.UUID;

public interface VendorOrganizationRepository extends JpaRepository<VendorOrganization, UUID> {

    List<VendorOrganization> findAllByOrderByCreatedAtDesc();
}
