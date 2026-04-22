package owner.hood.application.outbound;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class OutboundCampaignForm {

    @NotNull
    private UUID vendorProspectId;

    @NotBlank
    private String primaryOfferAxis = "AXIS_2";

    private String providerCampaignId;

    @NotBlank
    private String campaignStage = "LIVE";

    public UUID getVendorProspectId() {
        return vendorProspectId;
    }

    public void setVendorProspectId(UUID vendorProspectId) {
        this.vendorProspectId = vendorProspectId;
    }

    public String getPrimaryOfferAxis() {
        return primaryOfferAxis;
    }

    public void setPrimaryOfferAxis(String primaryOfferAxis) {
        this.primaryOfferAxis = primaryOfferAxis;
    }

    public String getProviderCampaignId() {
        return providerCampaignId;
    }

    public void setProviderCampaignId(String providerCampaignId) {
        this.providerCampaignId = providerCampaignId;
    }

    public String getCampaignStage() {
        return campaignStage;
    }

    public void setCampaignStage(String campaignStage) {
        this.campaignStage = campaignStage;
    }
}
