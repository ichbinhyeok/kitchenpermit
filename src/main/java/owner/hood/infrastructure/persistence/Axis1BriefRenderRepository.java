package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.axis1.Axis1BriefRender;

import java.util.Optional;
import java.util.UUID;

public interface Axis1BriefRenderRepository extends JpaRepository<Axis1BriefRender, UUID> {

    Optional<Axis1BriefRender> findByJobId(UUID jobId);

    Optional<Axis1BriefRender> findByDeliveryToken(String deliveryToken);
}
