package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.vendor.VendorSetupProfile;

import java.util.Optional;
import java.util.UUID;

public interface VendorSetupProfileRepository extends JpaRepository<VendorSetupProfile, UUID> {

    Optional<VendorSetupProfile> findByVendorId(UUID vendorId);
}
