package owner.hood.application.axis1;

import java.util.Map;
import java.util.Optional;

public interface Axis1ReportAssetStorage {

    Axis1ReportAssetStorageResult preparePayload(String publicId, Map<String, Object> payload);

    String storeAsset(String publicId, String fileName, byte[] bytes, String contentType);

    Optional<Axis1StoredAsset> loadAsset(String publicId, String fileName);

    void deleteReportAssets(String publicId);
}
