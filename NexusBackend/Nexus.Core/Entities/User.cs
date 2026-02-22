using System;

namespace Nexus.Core.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty; 
        public string Role { get; set; } = "User"; // SuperAdmin, CompanyAdmin, User
        public DateTime RegisteredAt { get; set; } = DateTime.Now;
        
        // Hangi şirketin personeli/müşterisi?
        public int? CompanyId { get; set; }
    }
}