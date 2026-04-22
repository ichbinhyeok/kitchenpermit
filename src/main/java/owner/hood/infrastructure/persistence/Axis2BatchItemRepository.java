package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.axis2.Axis2BatchItem;

import java.util.List;
import java.util.UUID;

public interface Axis2BatchItemRepository extends JpaRepository<Axis2BatchItem, UUID> {

    List<Axis2BatchItem> findByBatchIdOrderByRankOrderAsc(UUID batchId);
}
