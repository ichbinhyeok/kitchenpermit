package owner.hood.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.auth.AccountUser;

public interface AccountUserRepository extends JpaRepository<AccountUser, UUID> {

    Optional<AccountUser> findByEmail(String email);

    boolean existsByEmail(String email);
}
