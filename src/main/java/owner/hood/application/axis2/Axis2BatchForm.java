package owner.hood.application.axis2;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class Axis2BatchForm {

    @NotNull
    private UUID vendorId;

    @NotBlank
    private String batchType = "PAID_BATCH";

    @NotBlank
    private String targetMetroScope = "Austin";

    @Min(1)
    @Max(25)
    private int intendedSize = 10;

    public UUID getVendorId() {
        return vendorId;
    }

    public void setVendorId(UUID vendorId) {
        this.vendorId = vendorId;
    }

    public String getBatchType() {
        return batchType;
    }

    public void setBatchType(String batchType) {
        this.batchType = batchType;
    }

    public String getTargetMetroScope() {
        return targetMetroScope;
    }

    public void setTargetMetroScope(String targetMetroScope) {
        this.targetMetroScope = targetMetroScope;
    }

    public int getIntendedSize() {
        return intendedSize;
    }

    public void setIntendedSize(int intendedSize) {
        this.intendedSize = intendedSize;
    }
}
