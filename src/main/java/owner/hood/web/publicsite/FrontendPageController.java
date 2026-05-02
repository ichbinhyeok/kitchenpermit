package owner.hood.web.publicsite;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.server.ResponseStatusException;

@Controller
public class FrontendPageController {

    private final ResourceLoader resourceLoader;

    public FrontendPageController(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @GetMapping({
            "/",
            "/axis-1",
            "/axis-1/{*path}",
            "/axis-2",
            "/exports/{*path}",
            "/p/{*path}",
            "/pricing",
            "/reports/{*path}",
            "/samples",
            "/samples/{*path}",
            "/start",
            "/start/{*path}"
    })
    public String serveFrontendPage(HttpServletRequest request) {
        String requestPath = normalizePath(request.getRequestURI());
        String htmlPath = "/".equals(requestPath) ? "/index.html" : requestPath + ".html";
        Resource resource = resourceLoader.getResource("classpath:/static" + htmlPath);

        if (!resource.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        return "forward:" + htmlPath;
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
}
