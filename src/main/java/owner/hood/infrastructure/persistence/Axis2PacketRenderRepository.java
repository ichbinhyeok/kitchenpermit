package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.axis2.Axis2PacketRender;

import java.util.Optional;
import java.util.UUID;

public interface Axis2PacketRenderRepository extends JpaRepository<Axis2PacketRender, UUID> {

    Optional<Axis2PacketRender> findByDeliveryToken(String deliveryToken);
}
