package owner.hood.web.publicapi;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientResponseException;
import owner.hood.application.auth.AccountUserDetailsService;
import owner.hood.application.billing.PaddleBillingService;
import owner.hood.application.billing.PaddleCheckoutSession;
import owner.hood.application.billing.PaddleWebhookResult;
import owner.hood.application.billing.PaddleWebhookService;
import owner.hood.application.billing.PaddleWebhookVerifier;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
public class BillingApiController {

    private final PaddleBillingService paddleBillingService;
    private final PaddleWebhookVerifier paddleWebhookVerifier;
    private final PaddleWebhookService paddleWebhookService;

    public BillingApiController(
            PaddleBillingService paddleBillingService,
            PaddleWebhookVerifier paddleWebhookVerifier,
            PaddleWebhookService paddleWebhookService
    ) {
        this.paddleBillingService = paddleBillingService;
        this.paddleWebhookVerifier = paddleWebhookVerifier;
        this.paddleWebhookService = paddleWebhookService;
    }

    @GetMapping("/api/billing/paddle/config")
    public ResponseEntity<Map<String, Object>> paddleConfig() {
        return ResponseEntity.ok(paddleBillingService.publicConfig());
    }

    @PostMapping("/api/billing/paddle/checkout")
    public ResponseEntity<Map<String, Object>> createPaddleCheckout(Authentication authentication) {
        Optional<String> accountEmail = authenticatedEmail(authentication);

        if (accountEmail.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Login is required before starting the company version checkout.",
                    "loginHref", "/login?next=/company-version"
            ));
        }

        if (!paddleBillingService.configuredForCheckout()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "message", "Paddle checkout is not configured yet.",
                    "config", paddleBillingService.publicConfig()
            ));
        }

        try {
            return ResponseEntity.ok(checkoutResponse(paddleBillingService.createCompanyCheckout(accountEmail.get())));
        } catch (RestClientResponseException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of(
                    "message", "Paddle could not create a checkout transaction. Check the sandbox API key and price id.",
                    "status", exception.getStatusCode().value()
            ));
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "message", exception.getMessage()
            ));
        }
    }

    @PostMapping("/api/billing/paddle/webhook")
    public ResponseEntity<Map<String, Object>> handlePaddleWebhook(
            @RequestBody byte[] rawBody,
            @RequestHeader(value = "Paddle-Signature", required = false) String signature
    ) {
        if (!paddleWebhookVerifier.configured()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "message", "Paddle webhook secret is not configured."
            ));
        }

        if (!paddleWebhookVerifier.verify(rawBody, signature)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Invalid Paddle webhook signature."
            ));
        }

        try {
            PaddleWebhookResult result = paddleWebhookService.handle(rawBody);

            return ResponseEntity.ok(Map.of(
                    "ok", true,
                    "eventId", result.eventId(),
                    "eventType", result.eventType(),
                    "action", result.action(),
                    "accountEmail", result.accountEmail(),
                    "subscriptionId", result.subscriptionId(),
                    "status", result.status()
            ));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", exception.getMessage()
            ));
        }
    }

    private Map<String, Object> checkoutResponse(PaddleCheckoutSession session) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("provider", session.provider());
        response.put("environment", session.environment());
        response.put("clientToken", session.clientToken());
        response.put("companyPriceId", session.companyPriceId());
        response.put("checkoutMode", session.checkoutMode());
        response.put("transactionId", session.transactionId());
        response.put("accountEmail", session.accountEmail());
        response.put("successUrl", session.successUrl());
        response.put("fallbackReason", session.fallbackReason());
        return response;
    }

    private Optional<String> authenticatedEmail(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof OAuth2User oauth2User) {
            Object email = oauth2User.getAttributes().get("email");

            if (email instanceof String emailString) {
                String normalized = AccountUserDetailsService.normalizeEmail(emailString);
                return normalized.isBlank() ? Optional.empty() : Optional.of(normalized);
            }
        }

        String normalized = AccountUserDetailsService.normalizeEmail(authentication.getName());
        return normalized.isBlank() ? Optional.empty() : Optional.of(normalized);
    }
}
