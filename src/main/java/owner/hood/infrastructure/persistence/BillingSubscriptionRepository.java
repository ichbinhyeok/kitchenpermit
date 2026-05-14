package owner.hood.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.billing.BillingSubscription;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BillingSubscriptionRepository extends JpaRepository<BillingSubscription, UUID> {

    Optional<BillingSubscription> findByProviderSubscriptionId(String providerSubscriptionId);

    List<BillingSubscription> findByAccountEmailOrderByUpdatedAtDesc(String accountEmail);

    boolean existsByAccountEmailAndStatusIn(String accountEmail, List<String> statuses);
}
