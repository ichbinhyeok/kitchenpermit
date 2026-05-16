package owner.hood.application.auth;

import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetMailer {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetMailer.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final String siteName;
    private final String fromAddress;
    private final String mailHost;

    public PasswordResetMailer(
            ObjectProvider<JavaMailSender> mailSender,
            @Value("${hood.site.name:KitchenPermit}") String siteName,
            @Value("${hood.auth.password-reset.mail-from:${hood.site.support-email:compliance@kitchenpermit.com}}") String fromAddress,
            @Value("${spring.mail.host:}") String mailHost
    ) {
        this.mailSender = mailSender;
        this.siteName = siteName;
        this.fromAddress = fromAddress;
        this.mailHost = mailHost;
    }

    public void sendPasswordReset(String email, String resetHref, Instant expiresAt) {
        JavaMailSender sender = mailSender.getIfAvailable();

        if (sender == null || mailHost.isBlank()) {
            log.info("Password reset link for {}: {} (expires at {})", email, resetHref, expiresAt);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setFrom(fromAddress);
        message.setSubject("Reset your " + siteName + " password");
        message.setText(String.join("\n\n",
                "Use this link to set a new password for your " + siteName + " account:",
                resetHref,
                "This link expires at " + expiresAt + " and can only be used once.",
                "If you did not request this, you can ignore this email."
        ));
        sender.send(message);
    }
}
