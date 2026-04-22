package owner.hood.domain.outbound;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import owner.hood.domain.shared.AbstractAuditedEntity;

import java.time.Instant;

@Entity
@Table(name = "outbound_result_snapshots")
public class OutboundResultSnapshot extends AbstractAuditedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "campaign_id", nullable = false)
    private OutboundCampaign campaign;

    @Column(name = "analysis_window_start", nullable = false)
    private Instant analysisWindowStart;

    @Column(name = "analysis_window_end", nullable = false)
    private Instant analysisWindowEnd;

    @Column(name = "total_sent", nullable = false)
    private int totalSent;

    @Column(name = "delivered_count", nullable = false)
    private int deliveredCount;

    @Column(name = "bounced_count", nullable = false)
    private int bouncedCount;

    @Column(name = "positive_reply_count", nullable = false)
    private int positiveReplyCount;

    @Column(name = "neutral_reply_count", nullable = false)
    private int neutralReplyCount;

    @Column(name = "negative_reply_count", nullable = false)
    private int negativeReplyCount;

    @Column(name = "sample_request_count", nullable = false)
    private int sampleRequestCount;

    @Column(name = "paid_batch_order_count", nullable = false)
    private int paidBatchOrderCount;

    public OutboundCampaign getCampaign() {
        return campaign;
    }

    public void setCampaign(OutboundCampaign campaign) {
        this.campaign = campaign;
    }

    public Instant getAnalysisWindowStart() {
        return analysisWindowStart;
    }

    public void setAnalysisWindowStart(Instant analysisWindowStart) {
        this.analysisWindowStart = analysisWindowStart;
    }

    public Instant getAnalysisWindowEnd() {
        return analysisWindowEnd;
    }

    public void setAnalysisWindowEnd(Instant analysisWindowEnd) {
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
