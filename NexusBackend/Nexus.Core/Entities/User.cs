namespace Nexus.Core.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Admin";
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

        public int CompanyId { get; set; }
        public Company? Company { get; set; }
    }
}