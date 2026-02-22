namespace RestApi.Common
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
        public int StatusCode { get; set; } // Hata buradaydı muhtemelen, bu satırı kontrol et!

        public static ApiResponse<T> SuccessResponse(T data, string message = "Success", int statusCode = 200)
            => new() { Success = true, Data = data, Message = message, StatusCode = statusCode };

        public static ApiResponse<T> FailureResponse(string message, int statusCode = 400)
            => new() { Success = false, Message = message, StatusCode = statusCode };
    }
}