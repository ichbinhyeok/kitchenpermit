package owner.hood.application.axis1;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
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
    private final String billingProvider;

    public Axis1EntitlementService(
            BillingSubscriptionRepository subscriptions,
            @Value("${hood.billing.provider:abstract}") String billingProvider
    ) {
        this.subscriptions = subscriptions;
        this.billingProvider = billingProvider == null ? "abstract" : billingProvider.trim().toLowerCase(Locale.ROOT);
    }

    public Axis1AccountEntitlement resolve(Optional<String> accountEmail) {
        if (accountEmail.isEmpty()) {
            return new Axis1AccountEntitlement(
                    false,
                    false,
                    provider(),
                    "anonymous",
                    "free_builder",
                    FREE_FEATURES
            );
        }

        if ("paddle".equals(provider())) {
            boolean active = subscriptions.existsByAccountEmailAndStatusIn(accountEmail.get(), ACTIVE_BILLING_STATUSES);

            return new Axis1AccountEntitlement(
                    true,
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
}
