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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;
import owner.hood.domain.auth.AccountUser;
import owner.hood.domain.auth.EmailVerificationToken;
import owner.hood.infrastructure.persistence.AccountUserRepository;
import owner.hood.infrastructure.persistence.EmailVerificationTokenRepository;

@Service
public class EmailVerificationService {

    private static final SecureRandom secureRandom = new SecureRandom();

    private final AccountUserRepository accountUsers;
    private final EmailVerificationTokenRepository verificationTokens;
    private final EmailVerificationMailer mailer;
    private final String siteBaseUrl;
    private final Duration tokenLifetime;
    private final boolean required;

    public EmailVerificationService(
            AccountUserRepository accountUsers,
            EmailVerificationTokenRepository verificationTokens,
            EmailVerificationMailer mailer,
            @Value("${hood.site.base-url:https://kitchenpermit.com}") String siteBaseUrl,
            @Value("${hood.auth.email-verification.token-minutes:1440}") long tokenMinutes,
            @Value("${hood.auth.email-verification.required:false}") boolean required
    ) {
        this.accountUsers = accountUsers;
        this.verificationTokens = verificationTokens;
        this.mailer = mailer;
        this.siteBaseUrl = siteBaseUrl;
        this.tokenLifetime = Duration.ofMinutes(Math.max(15, tokenMinutes));
        this.required = required;
    }

    @Transactional
    public Optional<String> requestVerification(String email) {
        String normalizedEmail = AccountUserDetailsService.normalizeEmail(email);

        if (normalizedEmail.isBlank()) {
            return Optional.empty();
        }

        Optional<AccountUser> account = accountUsers.findByEmail(normalizedEmail);

        if (account.isEmpty() || !account.get().isEnabled() || account.get().isEmailVerified()) {
            return Optional.empty();
        }

        return issueVerification(account.get());
    }

    @Transactional
    public Optional<String> issueVerification(AccountUser account) {
        if (account == null || !account.isEnabled() || account.isEmailVerified()) {
            return Optional.empty();
        }

        Instant now = Instant.now();
        markOpenTokensUsed(account, now);

        String token = randomToken();
        Instant expiresAt = now.plus(tokenLifetime);
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setAccountUser(account);
        verificationToken.setTokenHash(hashToken(token));
        verificationToken.setExpiresAt(expiresAt);
        verificationTokens.save(verificationToken);

        String verificationHref = UriComponentsBuilder
                .fromUriString(siteBaseUrl)
                .path("/auth/email-verification/confirm")
                .queryParam("token", token)
                .build()
                .toUriString();
        mailer.sendEmailVerification(account.getEmail(), verificationHref, expiresAt);

        return Optional.of(verificationHref);
    }

    @Transactional
    public EmailVerificationResult confirmVerification(String token) {
        if (token == null || token.isBlank()) {
            return EmailVerificationResult.INVALID_TOKEN;
        }

        Optional<EmailVerificationToken> verificationToken =
                verificationTokens.findByTokenHashAndUsedAtIsNull(hashToken(token));

        if (verificationToken.isEmpty()) {
            return EmailVerificationResult.INVALID_TOKEN;
        }

        EmailVerificationToken tokenRecord = verificationToken.get();
        AccountUser account = tokenRecord.getAccountUser();
        Instant now = Instant.now();

        if (tokenRecord.getExpiresAt().isBefore(now)) {
            tokenRecord.setUsedAt(now);
            verificationTokens.save(tokenRecord);
            return EmailVerificationResult.EXPIRED_TOKEN;
        }

        if (!account.isEnabled()) {
            tokenRecord.setUsedAt(now);
            verificationTokens.save(tokenRecord);
            return EmailVerificationResult.INVALID_TOKEN;
        }

        if (!account.isEmailVerified()) {
            account.setEmailVerified(true);
            account.setEmailVerifiedAt(now);
            accountUsers.save(account);
        }

        markOpenTokensUsed(account, now);
        return EmailVerificationResult.SUCCESS;
    }

    @Transactional(readOnly = true)
    public boolean isVerified(String email) {
        String normalizedEmail = AccountUserDetailsService.normalizeEmail(email);

        if (normalizedEmail.isBlank()) {
            return false;
        }

        return accountUsers.findByEmail(normalizedEmail)
                .map(AccountUser::isEmailVerified)
                // OAuth-only accounts do not always have a local password row; rely on the identity provider.
                .orElse(true);
    }

    public boolean isRequired() {
        return required;
    }

    private void markOpenTokensUsed(AccountUser account, Instant usedAt) {
        verificationTokens.findByAccountUserAndUsedAtIsNull(account).forEach(token -> {
            token.setUsedAt(usedAt);
            verificationTokens.save(token);
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
            throw new IllegalStateException("SHA-256 is required for email verification tokens", exception);
        }
    }

    public enum EmailVerificationResult {
        SUCCESS,
        INVALID_TOKEN,
        EXPIRED_TOKEN
    }
}
