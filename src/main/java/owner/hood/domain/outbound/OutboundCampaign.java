package owner.hood.domain.outbound;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import owner.hood.domain.shared.AbstractAuditedEntity;

@Entity
@Table(name = "outbound_campaigns")
public class OutboundCampaign extends AbstractAuditedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_prospect_id", nullable = false)
    private VendorProspect vendorProspect;

    @Column(name = "primary_offer_axis", nullable = false)
    private String primaryOfferAxis;

    @Column(name = "execution_provider", nullable = false)
    private String executionProvider;

    @Column(name = "provider_campaign_id")
    private String providerCampaignId;

    @Enumerated(EnumType.STRING)
    @Column(name = "campaign_stage", nullable = false)
    private CampaignStage campaignStage;

    public VendorProspect getVendorProspect() {
        return vendorProspect;
    }

    public void setVendorProspect(VendorProspect vendorProspect) {
        this.vendorProspect = vendorProspect;
    }

    public String getPrimaryOfferAxis() {
        return primaryOfferAxis;
    }

    public void setPrimaryOfferAxis(String primaryOfferAxis) {
        this.primaryOfferAxis = primaryOfferAxis;
    }

    public String getExecutionProvider() {
        return executionProvider;
    }

    public void setExecutionProvider(String executionProvider) {
        this.executionProvider = executionProvider;
    }

    public String getProviderCampaignId() {
        return providerCampaignId;
    }

    public void setProviderCampaignId(String providerCampaignId) {
        this.providerCampaignId = providerCampaignId;
    }

    public CampaignStage getCampaignStage() {
        return campaignStage;
    }

    public void setCampaignStage(CampaignStage campaignStage) {
        this.campaignStage = campaignStage;
    }
}
