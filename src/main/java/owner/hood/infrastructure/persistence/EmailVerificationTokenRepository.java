package owner.hood.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import owner.hood.domain.auth.AccountUser;
import owner.hood.domain.auth.EmailVerificationToken;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {

    Optional<EmailVerificationToken> findByTokenHashAndUsedAtIsNull(String tokenHash);

    List<EmailVerificationToken> findByAccountUserAndUsedAtIsNull(AccountUser accountUser);
}
