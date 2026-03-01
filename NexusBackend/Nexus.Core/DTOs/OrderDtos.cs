namespace Nexus.API.DTOs
{
    // Frontend'den sipariş gelirken kullanılacak DTO
    public class CreateOrderDto
    {
        public int UserId { get; set; }
        public string OrderItems { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string OrderDate { get; set; } = string.Empty;
        public string Status { get; set; } = "Hazırlanıyor";
    }

    // Admin durum güncellerken kullanılacak DTO
    public class UpdateOrderStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}