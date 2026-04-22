package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.axis2.Axis2Batch;

import java.util.List;
import java.util.UUID;

public interface Axis2BatchRepository extends JpaRepository<Axis2Batch, UUID> {

    List<Axis2Batch> findAllByOrderByCreatedAtDesc();
}
