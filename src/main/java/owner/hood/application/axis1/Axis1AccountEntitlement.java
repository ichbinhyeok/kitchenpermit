package owner.hood.application.axis1;

import java.util.List;

public record Axis1AccountEntitlement(
        boolean authenticated,
        boolean emailVerified,
        boolean emailVerificationRequired,
        boolean companyAccess,
        String billingProvider,
        String billingStatus,
        String accessSource,
        List<String> enabledFeatures
) {

    public String effectivePlan(String requestedPlan) {
        if ("company".equals(requestedPlan) && companyAccess) {
            return "company";
        }

        return "free";
    }
}
