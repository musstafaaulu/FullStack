namespace Nexus.Core.Entities
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = "Genel";
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int CompanyId { get; set; }
        public Company? Company { get; set; }

        // Marka bağlantısı (opsiyonel)
        public int? BrandId { get; set; }
        public Brand? Brand { get; set; }

        // Kategori bağlantısı (string Category yanı sıra FK de tutuyoruz)
        public int? CategoryId { get; set; }
        public Category? CategoryNav { get; set; }
    }
}