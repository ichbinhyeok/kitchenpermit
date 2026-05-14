package owner.hood.infrastructure.persistence;

import owner.hood.domain.axis1.Axis1ReportRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface Axis1ReportRecordRepository extends JpaRepository<Axis1ReportRecord, UUID> {

    Optional<Axis1ReportRecord> findByPublicId(String publicId);

    Optional<Axis1ReportRecord> findByPublicIdAndAccountEmail(String publicId, String accountEmail);

    boolean existsByPublicId(String publicId);

    List<Axis1ReportRecord> findTop50ByAccountEmailOrderByCreatedAtDesc(String accountEmail);

    List<Axis1ReportRecord> findByProductPlanAndExpiresAtBefore(String productPlan, Instant expiresAt);

    long deleteByProductPlanAndExpiresAtBefore(String productPlan, Instant expiresAt);
}
