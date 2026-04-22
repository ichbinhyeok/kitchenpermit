package owner.hood.application.outbound;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class OutboundResultSnapshotForm {

    @NotNull
    private LocalDate analysisWindowStart = LocalDate.now().minusDays(7);

    @NotNull
    private LocalDate analysisWindowEnd = LocalDate.now();

    @Min(0)
    private int totalSent = 40;

    @Min(0)
    private int deliveredCount = 36;

    @Min(0)
    private int bouncedCount = 1;

    @Min(0)
    private int positiveReplyCount;

    @Min(0)
    private int neutralReplyCount;

    @Min(0)
    private int negativeReplyCount;

    @Min(0)
    private int sampleRequestCount;

    @Min(0)
    private int paidBatchOrderCount;

    public LocalDate getAnalysisWindowStart() {
        return analysisWindowStart;
    }

    public void setAnalysisWindowStart(LocalDate analysisWindowStart) {
        this.analysisWindowStart = analysisWindowStart;
    }

    public LocalDate getAnalysisWindowEnd() {
        return analysisWindowEnd;
    }

    public void setAnalysisWindowEnd(LocalDate analysisWindowEnd) {
        this.analysisWindowEnd = analysisWindowEnd;
    }

    public int getTotalSent() {
        return totalSent;
    }

    public void setTotalSent(int totalSent) {
        this.totalSent = totalSent;
    }

    public int getDeliveredCount() {
        return deliveredCount;
    }

    public void setDeliveredCount(int deliveredCount) {
        this.deliveredCount = deliveredCount;
    }

    public int getBouncedCount() {
        return bouncedCount;
    }

    public void setBouncedCount(int bouncedCount) {
        this.bouncedCount = bouncedCount;
    }

    public int getPositiveReplyCount() {
        return positiveReplyCount;
    }

    public void setPositiveReplyCount(int positiveReplyCount) {
        this.positiveReplyCount = positiveReplyCount;
    }

    public int getNeutralReplyCount() {
        return neutralReplyCount;
    }

    public void setNeutralReplyCount(int neutralReplyCount) {
        this.neutralReplyCount = neutralReplyCount;
    }

    public int getNegativeReplyCount() {
        return negativeReplyCount;
    }

    public void setNegativeReplyCount(int negativeReplyCount) {
        this.negativeReplyCount = negativeReplyCount;
    }

    public int getSampleRequestCount() {
        return sampleRequestCount;
    }

    public void setSampleRequestCount(int sampleRequestCount) {
        this.sampleRequestCount = sampleRequestCount;
    }

    public int getPaidBatchOrderCount() {
        return paidBatchOrderCount;
    }

    public void setPaidBatchOrderCount(int paidBatchOrderCount) {
        this.paidBatchOrderCount = paidBatchOrderCount;
    }
}
