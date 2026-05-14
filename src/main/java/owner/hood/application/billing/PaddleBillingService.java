package owner.hood.application.billing;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class PaddleBillingService {

    private final RestClient restClient;
    private final String provider;
    private final String environment;
    private final String companyPriceId;
    private final String apiKey;
    private final String clientToken;
    private final String apiBaseUrl;
    private final String siteBaseUrl;
    private final ObjectMapper objectMapper;

    public PaddleBillingService(
            RestClient.Builder restClientBuilder,
            @Value("${hood.billing.provider:abstract}") String provider,
            @Value("${hood.billing.environment:sandbox}") String environment,
            @Value("${hood.billing.paddle.company-price-id:}") String companyPriceId,
            @Value("${hood.billing.paddle.api-key:}") String apiKey,
            @Value("${hood.billing.paddle.client-token:}") String clientToken,
            @Value("${hood.billing.paddle.api-base-url:}") String apiBaseUrl,
            @Value("${hood.site.base-url:https://kitchenpermit.com}") String siteBaseUrl
    ) {
        this.restClient = restClientBuilder.build();
        this.provider = clean(provider);
        this.environment = normalizeEnvironment(environment);
        this.companyPriceId = clean(companyPriceId);
        this.apiKey = clean(apiKey);
        this.clientToken = clean(clientToken);
        this.apiBaseUrl = clean(apiBaseUrl);
        this.siteBaseUrl = trimTrailingSlash(clean(siteBaseUrl));
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> publicConfig() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("provider", providerOrAbstract());
        response.put("environment", environment);
        response.put("ready", configuredForCheckout());
        response.put("companyPriceId", companyPriceId);
        response.put("clientTokenPresent", !clientToken.isBlank());
        response.put("apiKeyPresent", !apiKey.isBlank());
        response.put("serverTransactionReady", configuredForServerTransactions());
        return response;
    }

    public boolean configuredForCheckout() {
        return "paddle".equals(providerOrAbstract())
                && !companyPriceId.isBlank()
                && !clientToken.isBlank();
    }

    public boolean configuredForServerTransactions() {
        return configuredForCheckout() && !apiKey.isBlank();
    }

    public PaddleCheckoutSession createCompanyCheckout(String accountEmail) {
        if (!configuredForCheckout()) {
            throw new IllegalStateException("Paddle checkout is not configured.");
        }

        if (apiKey.isBlank()) {
            return clientItemsCheckout(accountEmail, "Paddle API key is not configured; using client-side item checkout.");
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("collection_mode", "automatic");
        payload.put("items", List.of(Map.of(
                "price_id", companyPriceId,
                "quantity", 1
        )));
        payload.put("custom_data", Map.of(
                "hood_product", "axis1_company_version",
                "hood_account_email", accountEmail,
                "hood_source", "company_version_checkout"
        ));

        String responseBody;

        try {
            responseBody = restClient.post()
                    .uri(paddleApiBaseUrl() + "/transactions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(String.class);
        } catch (RestClientResponseException exception) {
            if (exception.getResponseBodyAsString().contains("transaction_default_checkout_url_not_set")) {
                return clientItemsCheckout(
                        accountEmail,
                        "Paddle default payment link is not set; using client-side item checkout."
                );
            }

            throw exception;
        }

        String transactionId = transactionId(responseBody);

        if (transactionId.isBlank()) {
            throw new IllegalStateException("Paddle did not return a transaction id.");
        }

        return new PaddleCheckoutSession(
                "paddle",
                environment,
                clientToken,
                companyPriceId,
                "transaction",
                transactionId,
                accountEmail,
                siteBaseUrl + "/dashboard?billing=checkout-complete",
                ""
        );
    }

    private PaddleCheckoutSession clientItemsCheckout(String accountEmail, String fallbackReason) {
        return new PaddleCheckoutSession(
                "paddle",
                environment,
                clientToken,
                companyPriceId,
                "items",
                null,
                accountEmail,
                siteBaseUrl + "/dashboard?billing=checkout-complete",
                fallbackReason
        );
    }

    private String transactionId(String responseBody) {
        try {
            JsonNode response = objectMapper.readTree(responseBody == null ? "" : responseBody);
            return response.path("data").path("id").asText("");
        } catch (Exception exception) {
            return "";
        }
    }

    private String paddleApiBaseUrl() {
        if (!apiBaseUrl.isBlank()) {
            return trimTrailingSlash(apiBaseUrl);
        }

        return "production".equals(environment)
                ? "https://api.paddle.com"
                : "https://sandbox-api.paddle.com";
    }

    private String providerOrAbstract() {
        return provider.isBlank() ? "abstract" : provider.toLowerCase(Locale.ROOT);
    }

    private static String normalizeEnvironment(String value) {
        String cleaned = clean(value).toLowerCase(Locale.ROOT);
        return ("production".equals(cleaned) || "live".equals(cleaned)) ? "production" : "sandbox";
    }

    private static String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private static String trimTrailingSlash(String value) {
        String cleaned = clean(value);
        while (cleaned.endsWith("/")) {
            cleaned = cleaned.substring(0, cleaned.length() - 1);
        }
        return cleaned;
    }
}
