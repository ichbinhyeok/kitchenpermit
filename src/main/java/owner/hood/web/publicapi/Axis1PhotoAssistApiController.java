package owner.hood.web.publicapi;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import owner.hood.application.axis1.Axis1PhotoAssistService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/axis1/photo-assist")
public class Axis1PhotoAssistApiController {

    private final Axis1PhotoAssistService axis1PhotoAssistService;

    public Axis1PhotoAssistApiController(Axis1PhotoAssistService axis1PhotoAssistService) {
        this.axis1PhotoAssistService = axis1PhotoAssistService;
    }

    @PostMapping
    public Axis1PhotoAssistService.Axis1PhotoAssistResponse suggestPhotos(
            @RequestBody(required = false) Axis1PhotoAssistRequest request
    ) {
        List<Axis1PhotoAssistService.Axis1PhotoAssistInputPhoto> photos = request == null
                ? List.of()
                : request.photos();
        return axis1PhotoAssistService.suggest(photos);
    }

    @ExceptionHandler(Axis1PhotoAssistService.Axis1PhotoAssistValidationException.class)
    public ResponseEntity<Map<String, String>> handleValidationFailure(
            Axis1PhotoAssistService.Axis1PhotoAssistValidationException exception
    ) {
        return ResponseEntity.status(exception.statusCode())
                .body(Map.of("error", exception.getMessage()));
    }

    public record Axis1PhotoAssistRequest(
            List<Axis1PhotoAssistService.Axis1PhotoAssistInputPhoto> photos
    ) {
    }
}
