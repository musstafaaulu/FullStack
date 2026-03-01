namespace Nexus.API.DTOs
{
    public class RegisterCompanyDto
    {
        public string CompanyName { get; set; } = "";
        public string CompanyEmail { get; set; } = "";
        public string? CompanyPhone { get; set; }
        public string? CompanyAddress { get; set; }
        public string? CompanyWebsite { get; set; }

        public string OwnerFullName { get; set; } = "";
        public string OwnerEmail { get; set; } = "";
        public string OwnerPassword { get; set; } = "";
    }
}
