package owner.hood.web.publicapi;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import owner.hood.application.axis1.Axis1EntitlementService;
import owner.hood.application.axis1.Axis1ReportAssetStorage;
import owner.hood.application.axis1.Axis1StoredAsset;
import owner.hood.domain.axis1.Axis1ReportRecord;
import owner.hood.infrastructure.persistence.Axis1ReportRecordRepository;

import java.time.Instant;
import java.util.Optional;

@RestController
public class Axis1ReportAssetController {

    private final Axis1ReportRecordRepository reportRecords;
    private final Axis1ReportAssetStorage assetStorage;
    private final Axis1EntitlementService entitlementService;

    public Axis1ReportAssetController(
            Axis1ReportRecordRepository reportRecords,
            Axis1ReportAssetStorage assetStorage,
            Axis1EntitlementService entitlementService
    ) {
        this.reportRecords = reportRecords;
        this.assetStorage = assetStorage;
        this.entitlementService = entitlementService;
    }

    @GetMapping("/api/axis1/assets/{publicId}/{fileName}")
    public ResponseEntity<byte[]> reportAsset(
            @PathVariable String publicId,
            @PathVariable String fileName
    ) {
        if (!publicId.matches("[A-Za-z0-9]{12,40}") || !fileName.matches("[A-Za-z0-9._-]+")) {
            return ResponseEntity.notFound().build();
        }

        return reportRecords.findByPublicId(publicId)
                .map(record -> serveAsset(record, fileName))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private ResponseEntity<byte[]> serveAsset(Axis1ReportRecord record, String fileName) {
        if (record.getExpiresAt() != null && record.getExpiresAt().isBefore(Instant.now())) {
            return ResponseEntity.status(HttpStatus.GONE).build();
        }

        if (isCompanySubscriptionInactive(record)) {
            return ResponseEntity.status(HttpStatus.GONE).build();
        }

        return assetStorage.loadAsset(record.getPublicId(), fileName)
                .map(asset -> ResponseEntity.ok()
                        .contentType(mediaType(asset, fileName))
                        .header(HttpHeaders.CACHE_CONTROL, "private, max-age=300")
                        .body(asset.bytes()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private MediaType mediaType(Axis1StoredAsset asset, String fileName) {
        if (asset.contentType() != null && !asset.contentType().isBlank()) {
            try {
                return MediaType.parseMediaType(asset.contentType());
            } catch (IllegalArgumentException ignored) {
                // Fall back to extension-based detection for malformed stored metadata.
            }
        }

        String lowerCaseName = fileName.toLowerCase();

        if (lowerCaseName.endsWith(".jpg") || lowerCaseName.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG;
        }

        if (lowerCaseName.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        }

        if (lowerCaseName.endsWith(".webp")) {
            return MediaType.parseMediaType("image/webp");
        }

        if (lowerCaseName.endsWith(".gif")) {
            return MediaType.IMAGE_GIF;
        }

        if (lowerCaseName.endsWith(".pdf")) {
            return MediaType.APPLICATION_PDF;
        }

        return MediaType.APPLICATION_OCTET_STREAM;
    }

    private boolean isCompanySubscriptionInactive(Axis1ReportRecord record) {
        if (!"company".equals(record.getProductPlan())) {
            return false;
        }

        String accountEmail = record.getAccountEmail();
        if (accountEmail == null || accountEmail.isBlank()) {
            return true;
        }

        return !entitlementService.resolve(Optional.of(accountEmail)).companyAccess();
    }
}
