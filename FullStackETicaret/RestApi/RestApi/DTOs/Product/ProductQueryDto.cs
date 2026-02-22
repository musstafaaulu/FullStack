namespace RestApi.DTOs.Product
{
    public class ProductQueryDto
    {
        public string? Search { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? Sort { get; set; } // "price_asc", "price_desc", "name_asc"
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}