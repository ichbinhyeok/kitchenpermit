package owner.hood.application.axis1;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import owner.hood.domain.auth.AccountUser;
import owner.hood.infrastructure.persistence.AccountUserRepository;
import owner.hood.infrastructure.persistence.BillingSubscriptionRepository;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class Axis1EntitlementService {

    private static final List<String> FREE_FEATURES = List.of(
            "free_7_day_link",
            "watermarked_pdf"
    );
    private static final List<String> COMPANY_FEATURES = List.of(
            "saved_branding",
            "clean_pdf",
            "live_links",
            "report_history",
            "load_report_into_builder"
    );
    private static final List<String> ACTIVE_BILLING_STATUSES = List.of("active", "trialing");

    private final BillingSubscriptionRepository subscriptions;
    private final AccountUserRepository accountUsers;
    private final String billingProvider;
    private final boolean emailVerificationRequired;

    public Axis1EntitlementService(
            BillingSubscriptionRepository subscriptions,
            AccountUserRepository accountUsers,
            @Value("${hood.billing.provider:abstract}") String billingProvider,
            @Value("${hood.auth.email-verification.required:false}") boolean emailVerificationRequired
    ) {
        this.subscriptions = subscriptions;
        this.accountUsers = accountUsers;
        this.billingProvider = billingProvider == null ? "abstract" : billingProvider.trim().toLowerCase(Locale.ROOT);
        this.emailVerificationRequired = emailVerificationRequired;
    }

    public Axis1AccountEntitlement resolve(Optional<String> accountEmail) {
        if (accountEmail.isEmpty()) {
            return new Axis1AccountEntitlement(
                    false,
                    false,
                    emailVerificationRequired,
                    false,
                    provider(),
                    "anonymous",
                    "free_builder",
                    FREE_FEATURES
            );
        }

        boolean emailVerified = emailVerified(accountEmail.get());

        if (emailVerificationRequired && !emailVerified) {
            return new Axis1AccountEntitlement(
                    true,
                    false,
                    true,
                    false,
                    provider(),
                    "email_unverified",
                    "email_verification_required",
                    FREE_FEATURES
            );
        }

        if ("paddle".equals(provider())) {
            boolean active = subscriptions.existsByAccountEmailAndStatusIn(accountEmail.get(), ACTIVE_BILLING_STATUSES);

            return new Axis1AccountEntitlement(
                    true,
                    emailVerified,
                    emailVerificationRequired,
                    active,
                    "paddle",
                    active ? "active_subscription" : "login_no_subscription",
                    active ? "paddle_subscription" : "authenticated_account",
                    active ? COMPANY_FEATURES : FREE_FEATURES
            );
        }

        // Non-Paddle environments keep launch access so local/demo flows remain usable.
        return new Axis1AccountEntitlement(
                true,
                emailVerified,
                emailVerificationRequired,
                true,
                provider(),
                "launch_access",
                "authenticated_account",
                COMPANY_FEATURES
        );
    }

    private String provider() {
        return billingProvider.isBlank() ? "abstract" : billingProvider;
    }

    private boolean emailVerified(String email) {
        return accountUsers.findByEmail(email)
                .map(AccountUser::isEmailVerified)
                // OAuth-only accounts may not have a local password row; rely on the identity provider.
                .orElse(true);
    }
}
