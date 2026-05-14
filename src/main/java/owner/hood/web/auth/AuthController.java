package owner.hood.web.auth;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.beans.factory.ObjectProvider;
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
import owner.hood.config.SecurityConfig;
import owner.hood.domain.auth.AccountUser;
import owner.hood.infrastructure.persistence.AccountUserRepository;

@Controller
public class AuthController {

    private final ObjectProvider<ClientRegistrationRepository> clientRegistrations;
    private final AccountUserRepository accountUsers;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsService userDetailsService;

    public AuthController(
            ObjectProvider<ClientRegistrationRepository> clientRegistrations,
            AccountUserRepository accountUsers,
            PasswordEncoder passwordEncoder,
            UserDetailsService userDetailsService
    ) {
        this.clientRegistrations = clientRegistrations;
        this.accountUsers = accountUsers;
        this.passwordEncoder = passwordEncoder;
        this.userDetailsService = userDetailsService;
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
