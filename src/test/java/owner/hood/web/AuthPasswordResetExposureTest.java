package owner.hood.web;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "hood.site.base-url=http://127.0.0.1:8096",
        "hood.auth.password-reset.expose-dev-link=false",
        "hood.auth.password-reset.max-requests-per-hour=5",
        "hood.auth.password-reset.cooldown-seconds=0"
})
@AutoConfigureMockMvc
class AuthPasswordResetExposureTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void passwordResetDoesNotExposeTokenWhenDevLinkExposureIsOff() throws Exception {
        String email = "owner-" + UUID.randomUUID() + "@example.com";

        mockMvc.perform(post("/auth/signup")
                        .param("email", email)
                        .param("password", "correct-horse-1")
                        .param("confirmPassword", "correct-horse-1")
                        .param("next", "/dashboard"))
                .andExpect(status().is3xxRedirection());

        mockMvc.perform(post("/auth/password-reset/request")
                        .param("email", email))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/forgot-password?sent=1"));
    }
}
