namespace Nexus.Core.Entities
{
    public class Banner
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public int Order { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int CompanyId { get; set; }
        public Company? Company { get; set; }
    }
}