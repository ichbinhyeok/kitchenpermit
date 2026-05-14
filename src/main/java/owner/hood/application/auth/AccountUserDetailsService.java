package owner.hood.application.auth;

import java.util.Locale;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import owner.hood.infrastructure.persistence.AccountUserRepository;

@Service
public class AccountUserDetailsService implements UserDetailsService {

    private final AccountUserRepository accountUsers;

    public AccountUserDetailsService(AccountUserRepository accountUsers) {
        this.accountUsers = accountUsers;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String email = normalizeEmail(username);

        return accountUsers.findByEmail(email)
                .map(account -> User.withUsername(account.getEmail())
                        .password(account.getPasswordHash())
                        .roles("USER")
                        .disabled(!account.isEnabled())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Account not found"));
    }

    public static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
