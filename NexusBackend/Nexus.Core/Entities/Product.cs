using System;

namespace Nexus.Core.Entities
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = "Genel";
        public int Stock { get; set; }
        public string Img { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        // Multi-tenant yapı (Hocanın istediği şirket izolasyonu için)
        public int CompanyId { get; set; } 
    }
}