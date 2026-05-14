package owner.hood.infrastructure.persistence;

import owner.hood.domain.axis1.Axis1CompanyProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface Axis1CompanyProfileRepository extends JpaRepository<Axis1CompanyProfile, UUID> {

    Optional<Axis1CompanyProfile> findByAccountEmail(String accountEmail);
}
