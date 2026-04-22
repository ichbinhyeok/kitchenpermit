package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.axis1.Axis1Finding;

import java.util.List;
import java.util.UUID;

public interface Axis1FindingRepository extends JpaRepository<Axis1Finding, UUID> {

    List<Axis1Finding> findByJobIdOrderByCreatedAtAsc(UUID jobId);
}
