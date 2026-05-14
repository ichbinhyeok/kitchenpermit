package owner.hood.application.axis1;

public record Axis1PdfExportCapability(
        String driver,
        String mode,
        boolean serverDownloadReady,
        String currentAction,
        String externalProviderTarget,
        String downloadHref,
        String fileName,
        String contentType,
        String generatedAt
) {
}
