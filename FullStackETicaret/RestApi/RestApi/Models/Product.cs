namespace RestApi.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string Img { get; set; } = "https://picsum.photos/300/200";
        // EKSİK OLAN SATIR BURASI:
        public DateTime CreatedDate { get; set; } = DateTime.Now; 
    }
}