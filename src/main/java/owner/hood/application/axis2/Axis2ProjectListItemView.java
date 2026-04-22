package owner.hood.application.axis2;

public record Axis2ProjectListItemView(
        String businessName,
        String streetAddress,
        String cityName,
        String triggerType,
        int finalScore,
        String eligibilityStatus,
        String topContactLine,
        String sourceLabel,
        String lastSeenTriggerDateText
) {
}
