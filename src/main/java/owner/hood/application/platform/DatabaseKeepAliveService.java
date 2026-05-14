package owner.hood.application.platform;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "hood.database.keepalive.enabled", havingValue = "true", matchIfMissing = true)
public class DatabaseKeepAliveService {

    private static final Logger log = LoggerFactory.getLogger(DatabaseKeepAliveService.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseKeepAliveService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Scheduled(
            initialDelayString = "${hood.database.keepalive.initial-delay-ms:60000}",
            fixedDelayString = "${hood.database.keepalive.delay-ms:43200000}"
    )
    public void pingDatabase() {
        try {
            Integer result = jdbcTemplate.queryForObject("select 1", Integer.class);

            if (result == null || result != 1) {
                log.warn("Database keepalive returned unexpected result: {}", result);
            }
        } catch (RuntimeException exception) {
            log.warn("Database keepalive failed", exception);
        }
    }
}
