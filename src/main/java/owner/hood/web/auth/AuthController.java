package owner.hood.web.auth;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;
import owner.hood.application.auth.AccountUserDetailsService;
import owner.hood.application.auth.PasswordResetRateLimiter;
import owner.hood.application.auth.PasswordResetService;
import owner.hood.application.auth.PasswordResetService.ResetPasswordResult;
import owner.hood.config.SecurityConfig;
import owner.hood.domain.auth.AccountUser;
import owner.hood.infrastructure.persistence.AccountUserRepository;

@Controller
public class AuthController {

    private final ObjectProvider<ClientRegistrationRepository> clientRegistrations;
    private final AccountUserRepository accountUsers;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsService userDetailsService;
    private final PasswordResetService passwordResetService;
    private final PasswordResetRateLimiter passwordResetRateLimiter;
    private final String siteBaseUrl;
    private final boolean exposeDevResetLink;

    public AuthController(
            ObjectProvider<ClientRegistrationRepository> clientRegistrations,
            AccountUserRepository accountUsers,
            PasswordEncoder passwordEncoder,
            UserDetailsService userDetailsService,
            PasswordResetService passwordResetService,
            PasswordResetRateLimiter passwordResetRateLimiter,
            @Value("${hood.site.base-url:https://kitchenpermit.com}") String siteBaseUrl,
            @Value("${hood.auth.password-reset.expose-dev-link:false}") boolean exposeDevResetLink
    ) {
        this.clientRegistrations = clientRegistrations;
        this.accountUsers = accountUsers;
        this.passwordEncoder = passwordEncoder;
        this.userDetailsService = userDetailsService;
        this.passwordResetService = passwordResetService;
        this.passwordResetRateLimiter = passwordResetRateLimiter;
        this.siteBaseUrl = siteBaseUrl;
        this.exposeDevResetLink = exposeDevResetLink;
    }

    @GetMapping("/auth/google")
    public RedirectView startGoogleLogin(
            @RequestParam(name = "next", required = false) String next,
            HttpServletRequest request
    ) {
        if (!hasGoogleRegistration()) {
            return new RedirectView("/login?auth=google-missing", true);
        }

        request.getSession().setAttribute(
                SecurityConfig.savedNextPathSessionKey(),
                SecurityConfig.safeNextPath(next, "/dashboard")
        );

        return new RedirectView("/oauth2/authorization/google", true);
    }

    @PostMapping("/auth/signup")
    public RedirectView signup(
            @RequestParam(name = "email") String email,
            @RequestParam(name = "password") String password,
            @RequestParam(name = "confirmPassword") String confirmPassword,
            @RequestParam(name = "next", required = false) String next,
            HttpServletRequest request
    ) {
        String normalizedEmail = AccountUserDetailsService.normalizeEmail(email);

        if (normalizedEmail.isBlank() || password == null || password.length() < 8) {
            return new RedirectView("/login?mode=signup&auth=weak-password", true);
        }

        if (!password.equals(confirmPassword)) {
            return new RedirectView("/login?mode=signup&auth=password-mismatch", true);
        }

        if (accountUsers.existsByEmail(normalizedEmail)) {
            return new RedirectView("/login?auth=exists", true);
        }

        AccountUser account = new AccountUser();
        account.setEmail(normalizedEmail);
        account.setPasswordHash(passwordEncoder.encode(password));
        account.setEnabled(true);
        accountUsers.save(account);

        authenticateNewAccount(normalizedEmail, request);

        return new RedirectView(SecurityConfig.safeNextPath(next, "/dashboard"), true);
    }

    @PostMapping("/auth/password-reset/request")
    public RedirectView requestPasswordReset(
            @RequestParam(name = "email") String email,
            HttpServletRequest request
    ) {
        String redirect = "/forgot-password?sent=1";
        var resetHref = passwordResetRateLimiter.allow(email, request.getRemoteAddr())
                ? passwordResetService.requestPasswordReset(email)
                : java.util.Optional.<String>empty();

        if (shouldExposeResetHref() && resetHref.isPresent()) {
            redirect = redirect + "&reset=" + URLEncoder.encode(resetHref.get(), StandardCharsets.UTF_8);
        }

        return new RedirectView(redirect, true);
    }

    @PostMapping("/auth/password-reset/confirm")
    public RedirectView confirmPasswordReset(
            @RequestParam(name = "token", required = false) String token,
            @RequestParam(name = "password") String password,
            @RequestParam(name = "confirmPassword") String confirmPassword
    ) {
        String tokenQuery = token == null || token.isBlank()
                ? ""
                : "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
        String authSeparator = tokenQuery.isBlank() ? "?auth=" : "&auth=";

        if (!password.equals(confirmPassword)) {
            return new RedirectView("/reset-password" + tokenQuery + authSeparator + "password-mismatch", true);
        }

        ResetPasswordResult result = passwordResetService.resetPassword(token, password);

        if (result == ResetPasswordResult.SUCCESS) {
            return new RedirectView("/login?auth=password-reset", true);
        }

        if (result == ResetPasswordResult.WEAK_PASSWORD) {
            return new RedirectView("/reset-password" + tokenQuery + authSeparator + "weak-password", true);
        }

        if (result == ResetPasswordResult.EXPIRED_TOKEN) {
            return new RedirectView("/reset-password?auth=expired-token", true);
        }

        return new RedirectView("/reset-password?auth=invalid-token", true);
    }

    @GetMapping("/auth/session")
    @ResponseBody
    public Map<String, Object> currentSession(Authentication authentication) {
        boolean authenticated = authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);

        return Map.of(
                "authenticated", authenticated,
                "name", authenticated ? authentication.getName() : ""
        );
    }

    private boolean hasGoogleRegistration() {
        ClientRegistrationRepository repository = clientRegistrations.getIfAvailable();

        if (repository == null) {
            return false;
        }

        try {
            ClientRegistration registration = repository.findByRegistrationId("google");
            return registration != null;
        } catch (RuntimeException ignored) {
            return false;
        }
    }

    private boolean shouldExposeResetHref() {
        return exposeDevResetLink;
    }

    private void authenticateNewAccount(String email, HttpServletRequest request) {
        UserDetails user = userDetailsService.loadUserByUsername(email);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user,
                null,
                user.getAuthorities()
        );
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        request.getSession(true).setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                context
        );
    }
}
