package owner.hood.application.axis1;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import owner.hood.domain.axis1.Axis1ReportRecord;
import owner.hood.infrastructure.persistence.Axis1ReportRecordRepository;

import java.time.Instant;
import java.util.List;

@Service
public class Axis1ReportRetentionService {

    private final Axis1ReportRecordRepository reportRecords;
    private final Axis1ReportAssetStorage assetStorage;

    public Axis1ReportRetentionService(
            Axis1ReportRecordRepository reportRecords,
            Axis1ReportAssetStorage assetStorage
    ) {
        this.reportRecords = reportRecords;
        this.assetStorage = assetStorage;
    }

    @Scheduled(cron = "0 17 3 * * *")
    @Transactional
    public void deleteExpiredFreeLinks() {
        Instant now = Instant.now();
        List<Axis1ReportRecord> expiredRecords = reportRecords.findByProductPlanAndExpiresAtBefore("free", now);

        for (Axis1ReportRecord record : expiredRecords) {
            assetStorage.deleteReportAssets(record.getPublicId());
        }

        reportRecords.deleteByProductPlanAndExpiresAtBefore("free", now);
    }
}
