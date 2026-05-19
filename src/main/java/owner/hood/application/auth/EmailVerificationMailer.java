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
public class EmailVerificationMailer {

    private static final Logger log = LoggerFactory.getLogger(EmailVerificationMailer.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final String siteName;
    private final String fromAddress;
    private final String mailHost;

    public EmailVerificationMailer(
            ObjectProvider<JavaMailSender> mailSender,
            @Value("${hood.site.name:KitchenPermit}") String siteName,
            @Value("${hood.auth.email-verification.mail-from:${hood.site.support-email:compliance@kitchenpermit.com}}") String fromAddress,
            @Value("${spring.mail.host:}") String mailHost
    ) {
        this.mailSender = mailSender;
        this.siteName = siteName;
        this.fromAddress = fromAddress;
        this.mailHost = mailHost;
    }

    public void sendEmailVerification(String email, String verificationHref, Instant expiresAt) {
        JavaMailSender sender = mailSender.getIfAvailable();

        if (sender == null || mailHost.isBlank()) {
            log.info("Email verification link for {}: {} (expires at {})", email, verificationHref, expiresAt);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setFrom(fromAddress);
        message.setSubject("Verify your " + siteName + " account email");
        message.setText(String.join("\n\n",
                "Use this link to verify the email address for your " + siteName + " account:",
                verificationHref,
                "This link expires at " + expiresAt + " and can only be used once.",
                "If you did not create this account, you can ignore this email."
        ));
        sender.send(message);
    }
}
