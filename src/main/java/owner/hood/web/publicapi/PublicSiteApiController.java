package owner.hood.web.publicapi;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import owner.hood.config.HoodSiteProperties;

@RestController
@RequestMapping("/api/public")
public class PublicSiteApiController {

    private final HoodSiteProperties siteProperties;

    public PublicSiteApiController(HoodSiteProperties siteProperties) {
        this.siteProperties = siteProperties;
    }

    @GetMapping("/site-config")
    public SiteConfigResponse siteConfig() {
        return new SiteConfigResponse(
                siteProperties.getName(),
                siteProperties.getBaseUrl(),
                siteProperties.getSupportEmail()
        );
    }

    public record SiteConfigResponse(
            String siteName,
            String baseUrl,
            String supportEmail
    ) {
    }
}
