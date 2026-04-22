package owner.hood.web.common;

import org.springframework.stereotype.Component;
import owner.hood.config.HoodSiteProperties;

@Component
public class PageMetaFactory {

    private final HoodSiteProperties siteProperties;

    public PageMetaFactory(HoodSiteProperties siteProperties) {
        this.siteProperties = siteProperties;
    }

    public PageMeta publicPage(String path, String title, String description) {
        return new PageMeta(path, title, description, "index,follow", absolute(path));
    }

    public PageMeta packetPage(String path, String title, String description) {
        return new PageMeta(path, title, description, "noindex,nofollow", absolute(path));
    }

    public String siteName() {
        return siteProperties.getName();
    }

    public String supportEmail() {
        return siteProperties.getSupportEmail();
    }

    private String absolute(String path) {
        return siteProperties.getBaseUrl().replaceAll("/$", "") + path;
    }
}
