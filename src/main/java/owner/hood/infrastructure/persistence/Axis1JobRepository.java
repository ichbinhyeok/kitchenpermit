package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.axis1.Axis1Job;

import java.util.UUID;

public interface Axis1JobRepository extends JpaRepository<Axis1Job, UUID> {
}
