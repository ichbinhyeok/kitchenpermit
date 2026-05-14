package owner.hood.application.axis1;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.net.URI;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@ConditionalOnProperty(name = "hood.axis1.asset-storage.driver", havingValue = "r2")
public class R2Axis1ReportAssetStorage implements Axis1ReportAssetStorage {

    private final S3Client s3Client;
    private final String bucket;
    private final String keyPrefix;

    public R2Axis1ReportAssetStorage(
            @Value("${hood.axis1.r2.bucket:}") String bucket,
            @Value("${hood.axis1.r2.endpoint:}") String endpoint,
            @Value("${hood.axis1.r2.access-key-id:}") String accessKeyId,
            @Value("${hood.axis1.r2.secret-access-key:}") String secretAccessKey,
            @Value("${hood.axis1.r2.region:auto}") String region,
            @Value("${hood.axis1.r2.key-prefix:axis1-reports}") String keyPrefix
    ) {
        this.bucket = required(bucket, "hood.axis1.r2.bucket");
        this.keyPrefix = normalizeKeyPrefix(keyPrefix);
        this.s3Client = S3Client.builder()
                .endpointOverride(URI.create(required(endpoint, "hood.axis1.r2.endpoint")))
                .region(Region.of(required(region, "hood.axis1.r2.region")))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(
                        required(accessKeyId, "hood.axis1.r2.access-key-id"),
                        required(secretAccessKey, "hood.axis1.r2.secret-access-key")
                )))
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)
                        .build())
                .httpClientBuilder(UrlConnectionHttpClient.builder())
                .build();
    }

    @Override
    public Axis1ReportAssetStorageResult preparePayload(String publicId, Map<String, Object> payload) {
        StoredAssetCounter counter = new StoredAssetCounter();
        Map<String, Object> preparedPayload = rewriteMap(publicId, payload, counter);
        preparedPayload.put("_assetStorage", Map.of(
                "driver", "r2",
                "mode", "s3_compatible_object_storage",
                "externalObjectStorageReady", true,
                "databaseInlinePhotos", false,
                "reportId", publicId,
                "inlinePhotoCount", counter.count()
        ));

        return new Axis1ReportAssetStorageResult(
                preparedPayload,
                "r2",
                "s3_compatible_object_storage",
                true,
                counter.count()
        );
    }

    @Override
    public String storeAsset(String publicId, String fileName, byte[] bytes, String contentType) {
        if (!fileName.matches("[A-Za-z0-9._-]+")) {
            throw new IllegalArgumentException("Invalid Axis 1 report asset file name");
        }

        String resolvedContentType = contentType == null || contentType.isBlank()
                ? contentTypeForFileName(fileName)
                : contentType;

        s3Client.putObject(PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(assetKey(publicId, fileName))
                        .contentType(resolvedContentType)
                        .cacheControl("private, max-age=300")
                        .build(),
                RequestBody.fromBytes(bytes));

        return "/api/axis1/assets/" + publicId + "/" + fileName;
    }

    @Override
    public Optional<Axis1StoredAsset> loadAsset(String publicId, String fileName) {
        try {
            ResponseBytes<GetObjectResponse> object = s3Client.getObjectAsBytes(GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(assetKey(publicId, fileName))
                    .build());
            String contentType = object.response().contentType();

            if (contentType == null || contentType.isBlank()) {
                contentType = contentTypeForFileName(fileName);
            }

            return Optional.of(new Axis1StoredAsset(object.asByteArray(), contentType));
        } catch (NoSuchKeyException exception) {
            return Optional.empty();
        } catch (S3Exception exception) {
            if (exception.statusCode() == 404) {
                return Optional.empty();
            }
            throw exception;
        }
    }

    @Override
    public void deleteReportAssets(String publicId) {
        String prefix = reportPrefix(publicId);
        String continuationToken = null;

        do {
            ListObjectsV2Response page = s3Client.listObjectsV2(ListObjectsV2Request.builder()
                    .bucket(bucket)
                    .prefix(prefix)
                    .continuationToken(continuationToken)
                    .build());

            page.contents().forEach(object -> s3Client.deleteObject(builder -> builder
                    .bucket(bucket)
                    .key(object.key())));

            continuationToken = page.nextContinuationToken();
        } while (continuationToken != null);
    }

    private Map<String, Object> rewriteMap(
            String publicId,
            Map<?, ?> source,
            StoredAssetCounter counter
    ) {
        Map<String, Object> rewritten = new LinkedHashMap<>();

        for (Map.Entry<?, ?> entry : source.entrySet()) {
            if (!(entry.getKey() instanceof String key)) {
                continue;
            }

            rewritten.put(key, rewriteValue(publicId, key, entry.getValue(), counter));
        }

        return rewritten;
    }

    private List<Object> rewriteList(String publicId, List<?> source, StoredAssetCounter counter) {
        List<Object> rewritten = new ArrayList<>();

        for (Object item : source) {
            rewritten.add(rewriteValue(publicId, "", item, counter));
        }

        return rewritten;
    }

    private Object rewriteValue(
            String publicId,
            String key,
            Object value,
            StoredAssetCounter counter
    ) {
        if ("src".equals(key) && value instanceof String source && source.startsWith("data:")) {
            return storeDataUrl(publicId, source, counter);
        }

        if (value instanceof Map<?, ?> map) {
            return rewriteMap(publicId, map, counter);
        }

        if (value instanceof List<?> list) {
            return rewriteList(publicId, list, counter);
        }

        return value;
    }

    private String storeDataUrl(String publicId, String dataUrl, StoredAssetCounter counter) {
        int commaIndex = dataUrl.indexOf(',');

        if (commaIndex < 0 || !dataUrl.startsWith("data:")) {
            return dataUrl;
        }

        String metadata = dataUrl.substring(5, commaIndex);
        String mimeType = metadata.split(";")[0];

        if (!metadata.contains(";base64") || !mimeType.startsWith("image/")) {
            return dataUrl;
        }

        byte[] bytes;

        try {
            bytes = Base64.getDecoder().decode(dataUrl.substring(commaIndex + 1));
        } catch (IllegalArgumentException ignored) {
            return dataUrl;
        }

        String fileName = "photo-" + counter.increment() + extensionForMimeType(mimeType);

        return storeAsset(publicId, fileName, bytes, mimeType);
    }

    private String assetKey(String publicId, String fileName) {
        return reportPrefix(publicId) + fileName;
    }

    private String reportPrefix(String publicId) {
        return keyPrefix + "/" + publicId + "/";
    }

    private String extensionForMimeType(String mimeType) {
        return switch (mimeType) {
            case "image/jpeg", "image/jpg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".bin";
        };
    }

    private String contentTypeForFileName(String fileName) {
        String lowerCaseName = fileName.toLowerCase();

        if (lowerCaseName.endsWith(".jpg") || lowerCaseName.endsWith(".jpeg")) {
            return "image/jpeg";
        }

        if (lowerCaseName.endsWith(".png")) {
            return "image/png";
        }

        if (lowerCaseName.endsWith(".webp")) {
            return "image/webp";
        }

        if (lowerCaseName.endsWith(".gif")) {
            return "image/gif";
        }

        if (lowerCaseName.endsWith(".pdf")) {
            return "application/pdf";
        }

        return "application/octet-stream";
    }

    private String normalizeKeyPrefix(String keyPrefix) {
        String normalized = keyPrefix == null ? "" : keyPrefix.trim();

        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }

        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }

        if (normalized.isBlank()) {
            return "axis1-reports";
        }

        return normalized;
    }

    private String required(String value, String propertyName) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(propertyName + " is required when R2 asset storage is enabled");
        }

        return value.trim();
    }

    private static class StoredAssetCounter {
        private int count;

        int increment() {
            count += 1;
            return count;
        }

        int count() {
            return count;
        }
    }
}
