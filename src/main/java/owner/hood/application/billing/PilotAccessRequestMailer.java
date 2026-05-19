package owner.hood.application.billing;

import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class PilotAccessRequestMailer {

    private static final Logger log = LoggerFactory.getLogger(PilotAccessRequestMailer.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final String siteName;
    private final String fromAddress;
    private final String notifyTo;
    private final String mailHost;

    public PilotAccessRequestMailer(
            ObjectProvider<JavaMailSender> mailSender,
            @Value("${hood.site.name:KitchenPermit}") String siteName,
            @Value("${hood.axis1.pilot.mail-from:${hood.site.support-email:compliance@kitchenpermit.com}}") String fromAddress,
            @Value("${hood.axis1.pilot.notify-to:${hood.site.support-email:compliance@kitchenpermit.com}}") String notifyTo,
            @Value("${spring.mail.host:}") String mailHost
    ) {
        this.mailSender = mailSender;
        this.siteName = siteName;
        this.fromAddress = fromAddress;
        this.notifyTo = notifyTo;
        this.mailHost = mailHost;
    }

    public void sendPilotAccessRequest(String accountEmail) {
        Instant requestedAt = Instant.now();
        JavaMailSender sender = mailSender.getIfAvailable();

        if (sender == null || mailHost.isBlank()) {
            log.info("Axis 1 pilot access request for {} at {}", accountEmail, requestedAt);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(notifyTo);
        message.setFrom(fromAddress);
        message.setReplyTo(accountEmail);
        message.setSubject("Axis 1 pilot access request - " + accountEmail);
        message.setText(String.join("\n\n",
                "A logged-in " + siteName + " account requested Axis 1 launch pilot access.",
                "Account email: " + accountEmail,
                "Requested at: " + requestedAt,
                "Offer shown to the user: 30 days of company access, no card required, in exchange for quick product feedback after the first service report.",
                "Action: review the account, enable 30 days of company access, then email the user when it is ready."
        ));
        sender.send(message);
    }
}
