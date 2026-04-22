package owner.hood.web.common;

public record PageMeta(
        String path,
        String title,
        String description,
        String robots,
        String canonicalUrl
) {
}
