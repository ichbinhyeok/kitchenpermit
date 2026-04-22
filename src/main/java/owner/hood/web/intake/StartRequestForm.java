package owner.hood.web.intake;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class StartRequestForm {

    @NotBlank
    private String companyName;

    @NotBlank
    private String contactName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String serviceArea;

    @NotBlank
    private String productInterest;

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getServiceArea() {
        return serviceArea;
    }

    public void setServiceArea(String serviceArea) {
        this.serviceArea = serviceArea;
    }

    public String getProductInterest() {
        return productInterest;
    }

    public void setProductInterest(String productInterest) {
        this.productInterest = productInterest;
    }
}
