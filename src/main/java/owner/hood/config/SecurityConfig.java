package owner.hood.config;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    private static final String SAVED_NEXT_PATH = "hood.auth.next";

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            ObjectProvider<ClientRegistrationRepository> clientRegistrations
    ) throws Exception {
        http
                // Existing exported forms do not emit CSRF tokens yet.
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/dashboard", "/dashboard/**").authenticated()
                        .anyRequest().permitAll()
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            String next = request.getRequestURI();
                            String query = request.getQueryString();

                            if (query != null && !query.isBlank()) {
                                next = next + "?" + query;
                            }

                            response.sendRedirect(
                                    "/login?next=" + URLEncoder.encode(next, StandardCharsets.UTF_8)
                            );
                        })
                )
                .logout(logout -> logout
                        .logoutUrl("/auth/logout")
                        .logoutSuccessUrl("/login?signed_out=1")
                        .permitAll()
                )
                .formLogin(form -> form
                        .loginPage("/login")
                        .loginProcessingUrl("/auth/login")
                        .usernameParameter("email")
                        .passwordParameter("password")
                        .successHandler((request, response, authentication) -> {
                            String next = request.getParameter("next");
                            if (next == null || next.isBlank()) {
                                next = (String) request.getSession().getAttribute(SAVED_NEXT_PATH);
                                request.getSession().removeAttribute(SAVED_NEXT_PATH);
                            }
                            response.sendRedirect(safeNextPath(next, "/dashboard"));
                        })
                        .failureUrl("/login?auth=failed")
                        .permitAll()
                );

        if (clientRegistrations.getIfAvailable() != null) {
            http.oauth2Login(oauth -> oauth
                    .loginPage("/login")
                    .successHandler((request, response, authentication) -> {
                        String next = (String) request.getSession().getAttribute(SAVED_NEXT_PATH);
                        request.getSession().removeAttribute(SAVED_NEXT_PATH);
                        response.sendRedirect(safeNextPath(next, "/dashboard"));
                    })
            );
        }

        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    public static String savedNextPathSessionKey() {
        return SAVED_NEXT_PATH;
    }

    public static String safeNextPath(String value, String fallback) {
        if (value == null || value.isBlank() || !value.startsWith("/") || value.startsWith("//")) {
            return fallback;
        }

        return value;
    }

}
