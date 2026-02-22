namespace RestApi.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Bir kategorinin birden fazla ürünü olabilir (1-N İlişkisi)
    public List<Product> Products { get; set; } = new();
}