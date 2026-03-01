namespace Nexus.API.DTOs
{
    public class CommentCreateDto
    {
        public int ProductId { get; set; }
        public string Text { get; set; } = string.Empty;
        public int Rating { get; set; } = 5;
    }

    public class CommentResponseDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int Rating { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CommentStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}