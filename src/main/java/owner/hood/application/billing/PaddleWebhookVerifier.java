package owner.hood.application.billing;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;

@Component
public class PaddleWebhookVerifier {

    private final String secret;
    private final long toleranceSeconds;
    private final Clock clock;

    public PaddleWebhookVerifier(
            @Value("${hood.billing.paddle.webhook-secret:${PADDLE_WEBHOOK_SECRET:}}") String secret,
            @Value("${hood.billing.paddle.webhook-tolerance-seconds:${PADDLE_WEBHOOK_TOLERANCE_SECONDS:300}}")
            long toleranceSeconds,
            Clock clock
    ) {
        this.secret = secret == null ? "" : secret.trim();
        this.toleranceSeconds = toleranceSeconds;
        this.clock = clock;
    }

    public boolean configured() {
        return !secret.isBlank();
    }

    public boolean verify(byte[] rawBody, String signatureHeader) {
        if (!configured() || signatureHeader == null || signatureHeader.isBlank()) {
            return false;
        }

        ParsedSignature parsed = parse(signatureHeader);

        if (parsed.timestamp().isBlank() || parsed.signatures().isEmpty()) {
            return false;
        }

        long timestamp;

        try {
            timestamp = Long.parseLong(parsed.timestamp());
        } catch (NumberFormatException exception) {
            return false;
        }

        long age = Math.abs(clock.instant().getEpochSecond() - timestamp);

        if (toleranceSeconds > 0 && age > toleranceSeconds) {
            return false;
        }

        String expected = expectedSignature(parsed.timestamp(), rawBody);

        return parsed.signatures().stream()
                .anyMatch(signature -> timingSafeEquals(expected, signature));
    }

    private ParsedSignature parse(String signatureHeader) {
        String timestamp = "";
        List<String> signatures = new ArrayList<>();

        for (String part : signatureHeader.split(";")) {
            String[] keyValue = part.split("=", 2);

            if (keyValue.length != 2) {
                continue;
            }

            if ("ts".equals(keyValue[0])) {
                timestamp = keyValue[1];
            } else if ("h1".equals(keyValue[0])) {
                signatures.add(keyValue[1]);
            }
        }

        return new ParsedSignature(timestamp, signatures);
    }

    private String expectedSignature(String timestamp, byte[] rawBody) {
        try {
            byte[] timestampBytes = timestamp.getBytes(StandardCharsets.UTF_8);
            byte[] signedPayload = new byte[timestampBytes.length + 1 + rawBody.length];
            System.arraycopy(timestampBytes, 0, signedPayload, 0, timestampBytes.length);
            signedPayload[timestampBytes.length] = (byte) ':';
            System.arraycopy(rawBody, 0, signedPayload, timestampBytes.length + 1, rawBody.length);

            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(signedPayload));
        } catch (Exception exception) {
            return "";
        }
    }

    private boolean timingSafeEquals(String expected, String actual) {
        if (expected.isBlank() || actual == null || actual.isBlank()) {
            return false;
        }

        byte[] expectedBytes = expected.getBytes(StandardCharsets.UTF_8);
        byte[] actualBytes = actual.toLowerCase().getBytes(StandardCharsets.UTF_8);

        return expectedBytes.length == actualBytes.length
                && MessageDigest.isEqual(expectedBytes, actualBytes);
    }

    private record ParsedSignature(String timestamp, List<String> signatures) {
    }
}
