namespace RestApi.DTOs.Category;

public class CategoryCreateDto
{
    public string Name { get; set; } = string.Empty;
}

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}