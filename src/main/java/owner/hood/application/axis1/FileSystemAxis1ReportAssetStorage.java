package owner.hood.application.axis1;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@ConditionalOnProperty(name = "hood.axis1.asset-storage.driver", havingValue = "filesystem", matchIfMissing = true)
public class FileSystemAxis1ReportAssetStorage implements Axis1ReportAssetStorage {

    private final Path storageRoot;

    public FileSystemAxis1ReportAssetStorage(
            @Value("${hood.storage.root:./storage}") String storageRoot
    ) {
        this.storageRoot = Path.of(storageRoot).toAbsolutePath().normalize();
    }

    @Override
    public Axis1ReportAssetStorageResult preparePayload(String publicId, Map<String, Object> payload) {
        StoredAssetCounter counter = new StoredAssetCounter();
        Map<String, Object> preparedPayload = rewriteMap(publicId, payload, counter);
        preparedPayload.put("_assetStorage", Map.of(
                "driver", "filesystem",
                "mode", "file_reference_payload",
                "externalObjectStorageReady", false,
                "databaseInlinePhotos", false,
                "target", "external_object_storage",
                "reportId", publicId,
                "inlinePhotoCount", counter.count()
        ));

        return new Axis1ReportAssetStorageResult(
                preparedPayload,
                "filesystem",
                "file_reference_payload",
                false,
                counter.count()
        );
    }

    @Override
    public String storeAsset(String publicId, String fileName, byte[] bytes, String contentType) {
        if (!fileName.matches("[A-Za-z0-9._-]+")) {
            throw new IllegalArgumentException("Invalid Axis 1 report asset file name");
        }

        Path reportDirectory = storageRoot.resolve("axis1-reports").resolve(publicId).normalize();
        Path assetPath = reportDirectory.resolve(fileName).normalize();

        if (!assetPath.startsWith(reportDirectory) || !reportDirectory.startsWith(storageRoot)) {
            throw new IllegalStateException("Resolved asset path escaped storage root");
        }

        try {
            Files.createDirectories(reportDirectory);
            Files.write(assetPath, bytes);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not store Axis 1 report asset", exception);
        }

        return "/api/axis1/assets/" + publicId + "/" + fileName;
    }

    @Override
    public Optional<Axis1StoredAsset> loadAsset(String publicId, String fileName) {
        Path reportDirectory = storageRoot.resolve("axis1-reports").resolve(publicId).normalize();
        Path assetPath = reportDirectory.resolve(fileName).normalize();

        if (!assetPath.startsWith(reportDirectory) || !reportDirectory.startsWith(storageRoot) || !Files.isRegularFile(assetPath)) {
            return Optional.empty();
        }

        try {
            return Optional.of(new Axis1StoredAsset(
                    Files.readAllBytes(assetPath),
                    contentTypeForFileName(fileName)
            ));
        } catch (IOException exception) {
            throw new IllegalStateException("Could not load Axis 1 report photo", exception);
        }
    }

    @Override
    public void deleteReportAssets(String publicId) {
        Path reportDirectory = storageRoot.resolve("axis1-reports").resolve(publicId).normalize();

        if (!reportDirectory.startsWith(storageRoot) || !Files.exists(reportDirectory)) {
            return;
        }

        try (var paths = Files.walk(reportDirectory)) {
            paths.sorted(Comparator.reverseOrder()).forEach(path -> {
                try {
                    Files.deleteIfExists(path);
                } catch (IOException ignored) {
                    // Asset cleanup should not block report deletion.
                }
            });
        } catch (IOException ignored) {
            // Asset cleanup is best-effort for the filesystem placeholder.
        }
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

        String assetId = "photo-" + (counter.increment());
        String extension = extensionForMimeType(mimeType);
        return storeAsset(publicId, assetId + extension, bytes, mimeType);
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
