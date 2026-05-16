package owner.hood.application.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;
import owner.hood.domain.auth.AccountUser;
import owner.hood.domain.auth.PasswordResetToken;
import owner.hood.infrastructure.persistence.AccountUserRepository;
import owner.hood.infrastructure.persistence.PasswordResetTokenRepository;

@Service
public class PasswordResetService {

    private static final SecureRandom secureRandom = new SecureRandom();

    private final AccountUserRepository accountUsers;
    private final PasswordResetTokenRepository resetTokens;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetMailer mailer;
    private final String siteBaseUrl;
    private final Duration tokenLifetime;

    public PasswordResetService(
            AccountUserRepository accountUsers,
            PasswordResetTokenRepository resetTokens,
            PasswordEncoder passwordEncoder,
            PasswordResetMailer mailer,
            @Value("${hood.site.base-url:https://kitchenpermit.com}") String siteBaseUrl,
            @Value("${hood.auth.password-reset.token-minutes:60}") long tokenMinutes
    ) {
        this.accountUsers = accountUsers;
        this.resetTokens = resetTokens;
        this.passwordEncoder = passwordEncoder;
        this.mailer = mailer;
        this.siteBaseUrl = siteBaseUrl;
        this.tokenLifetime = Duration.ofMinutes(Math.max(5, tokenMinutes));
    }

    @Transactional
    public Optional<String> requestPasswordReset(String email) {
        String normalizedEmail = AccountUserDetailsService.normalizeEmail(email);

        if (normalizedEmail.isBlank()) {
            return Optional.empty();
        }

        Optional<AccountUser> account = accountUsers.findByEmail(normalizedEmail);

        if (account.isEmpty() || !account.get().isEnabled()) {
            return Optional.empty();
        }

        Instant now = Instant.now();
        markOpenTokensUsed(account.get(), now);

        String token = randomToken();
        Instant expiresAt = now.plus(tokenLifetime);
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setAccountUser(account.get());
        resetToken.setTokenHash(hashToken(token));
        resetToken.setExpiresAt(expiresAt);
        resetTokens.save(resetToken);

        String resetHref = UriComponentsBuilder
                .fromUriString(siteBaseUrl)
                .path("/reset-password")
                .queryParam("token", token)
                .build()
                .toUriString();
        mailer.sendPasswordReset(normalizedEmail, resetHref, expiresAt);

        return Optional.of(resetHref);
    }

    @Transactional
    public ResetPasswordResult resetPassword(String token, String password) {
        if (password == null || password.length() < 8) {
            return ResetPasswordResult.WEAK_PASSWORD;
        }

        if (token == null || token.isBlank()) {
            return ResetPasswordResult.INVALID_TOKEN;
        }

        Optional<PasswordResetToken> resetToken =
                resetTokens.findByTokenHashAndUsedAtIsNull(hashToken(token));

        if (resetToken.isEmpty()) {
            return ResetPasswordResult.INVALID_TOKEN;
        }

        PasswordResetToken tokenRecord = resetToken.get();
        Instant now = Instant.now();

        if (tokenRecord.getExpiresAt().isBefore(now)) {
            tokenRecord.setUsedAt(now);
            resetTokens.save(tokenRecord);
            return ResetPasswordResult.EXPIRED_TOKEN;
        }

        AccountUser account = tokenRecord.getAccountUser();

        if (!account.isEnabled()) {
            tokenRecord.setUsedAt(now);
            resetTokens.save(tokenRecord);
            return ResetPasswordResult.INVALID_TOKEN;
        }

        account.setPasswordHash(passwordEncoder.encode(password));
        accountUsers.save(account);
        markOpenTokensUsed(account, now);

        return ResetPasswordResult.SUCCESS;
    }

    private void markOpenTokensUsed(AccountUser account, Instant usedAt) {
        resetTokens.findByAccountUserAndUsedAtIsNull(account).forEach(token -> {
            token.setUsedAt(usedAt);
            resetTokens.save(token);
        });
    }

    private static String randomToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is required for password reset tokens", exception);
        }
    }

    public enum ResetPasswordResult {
        SUCCESS,
        INVALID_TOKEN,
        EXPIRED_TOKEN,
        WEAK_PASSWORD
    }
}
