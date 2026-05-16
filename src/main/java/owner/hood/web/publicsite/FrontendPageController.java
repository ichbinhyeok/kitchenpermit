package owner.hood.web.publicsite;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.server.ResponseStatusException;
import owner.hood.web.common.RobotsHeaders;

@Controller
public class FrontendPageController {

    private final ResourceLoader resourceLoader;

    public FrontendPageController(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @GetMapping("/manifest.webmanifest")
    public ResponseEntity<Resource> serveWebManifest() {
        Resource resource = resourceLoader.getResource("classpath:/static/manifest.webmanifest");

        if (!resource.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/manifest+json"))
                .body(resource);
    }

    @GetMapping({
            "/",
            "/axis-1",
            "/axis-1/{*path}",
            "/axis-2",
            "/blocked-access-service-report-template",
            "/commercial-kitchen-exhaust-cleaning-report",
            "/company-version",
            "/dashboard",
            "/exports/{*path}",
            "/forgot-password",
            "/hood-cleaning-before-after-photo-report",
            "/hood-cleaning-certificate-vs-service-report",
            "/hood-cleaning-customer-closeout-email-template",
            "/hood-cleaning-service-report-template",
            "/kitchen-exhaust-cleaning-report-sample",
            "/login",
            "/nfpa-96-hood-cleaning-photo-checklist",
            "/p/{*path}",
            "/pricing",
            "/privacy",
            "/refund-policy",
            "/reports/{*path}",
            "/restaurant-hood-cleaning-report",
            "/resources",
            "/samples",
            "/samples/{*path}",
            "/send-hood-cleaning-report-after-service",
            "/start",
            "/start/{*path}",
            "/reset-password",
            "/terms"
    })
    public ResponseEntity<Resource> serveFrontendPage(HttpServletRequest request) {
        String requestPath = normalizePath(request.getRequestURI());
        String htmlPath = htmlPathFor(requestPath);
        Resource resource = resourceLoader.getResource("classpath:/static" + htmlPath);

        if (!resource.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        ResponseEntity.BodyBuilder response = ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML);

        if (isPrivateShareRoute(requestPath)) {
            response.header(RobotsHeaders.X_ROBOTS_TAG, RobotsHeaders.NO_INDEX_PRIVATE_CONTENT);
        }

        return response.body(resource);
    }

    private String normalizePath(String path) {
        if (path == null || path.isBlank() || "/".equals(path)) {
            return "/";
        }

        String normalized = path.startsWith("/") ? path : "/" + path;

        if (normalized.length() > 1 && normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }

        return normalized;
    }

    private String htmlPathFor(String requestPath) {
        if ("/".equals(requestPath)) {
            return "/index.html";
        }

        if (requestPath.endsWith(".html")) {
            return requestPath;
        }

        return requestPath + ".html";
    }

    private boolean isPrivateShareRoute(String requestPath) {
        return requestPath.equals("/p")
                || requestPath.startsWith("/p/")
                || requestPath.equals("/reports")
                || requestPath.startsWith("/reports/");
    }
}
