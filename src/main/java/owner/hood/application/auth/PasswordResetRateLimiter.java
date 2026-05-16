package owner.hood.application.auth;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetRateLimiter {

    private final Map<String, AttemptWindow> attempts = new ConcurrentHashMap<>();
    private final int maxRequestsPerWindow;
    private final Duration window;
    private final Duration cooldown;

    public PasswordResetRateLimiter(
            @Value("${hood.auth.password-reset.max-requests-per-hour:5}") int maxRequestsPerHour,
            @Value("${hood.auth.password-reset.cooldown-seconds:60}") long cooldownSeconds
    ) {
        this.maxRequestsPerWindow = Math.max(1, maxRequestsPerHour);
        this.window = Duration.ofHours(1);
        this.cooldown = Duration.ofSeconds(Math.max(0, cooldownSeconds));
    }

    public boolean allow(String email, String remoteAddress) {
        String normalizedEmail = AccountUserDetailsService.normalizeEmail(email);
        String normalizedRemote = remoteAddress == null || remoteAddress.isBlank()
                ? "unknown"
                : remoteAddress.trim();
        String key = normalizedEmail + "::" + normalizedRemote;
        Instant now = Instant.now();
        AtomicBoolean allowed = new AtomicBoolean(false);

        attempts.entrySet().removeIf(entry ->
                entry.getValue().windowStartedAt().plus(window).isBefore(now));

        attempts.compute(key, (ignored, current) -> {
            if (current == null || current.windowStartedAt().plus(window).isBefore(now)) {
                allowed.set(true);
                return new AttemptWindow(now, 1, now);
            }

            if (current.lastAttemptAt().plus(cooldown).isAfter(now)) {
                return current;
            }

            if (current.count() >= maxRequestsPerWindow) {
                return current;
            }

            allowed.set(true);
            return new AttemptWindow(
                    current.windowStartedAt(),
                    current.count() + 1,
                    now
            );
        });

        return allowed.get();
    }

    private record AttemptWindow(
            Instant windowStartedAt,
            int count,
            Instant lastAttemptAt
    ) {
    }
}
