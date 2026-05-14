package owner.hood.application.axis1;

import java.util.Map;

public record Axis1ReportAssetStorageResult(
        Map<String, Object> payload,
        String driver,
        String mode,
        boolean externalObjectStorageReady,
        int inlinePhotoCount
) {
}
