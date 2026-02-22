namespace RestApi.DTOs.Product;

public class ProductCreateDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int CategoryId { get; set; } // Bu satırın varlığını mutlaka kontrol et!
}