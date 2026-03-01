using System.Net;
using System.Text.Json;

namespace Nexus.API.Middleware
{
    // Program.cs'e ekle: app.UseMiddleware<ExceptionMiddleware>();
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Yetkisiz erişim: {Path}", context.Request.Path);
                await WriteError(context, HttpStatusCode.Unauthorized, ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Kayıt bulunamadı: {Path}", context.Request.Path);
                await WriteError(context, HttpStatusCode.NotFound, ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Beklenmeyen hata: {Path}", context.Request.Path);
                await WriteError(context, HttpStatusCode.InternalServerError, "Sunucu hatası oluştu.");
            }
        }

        private static async Task WriteError(HttpContext context, HttpStatusCode code, string message)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)code;

            var response = new
            {
                success = false,
                message = message,
                data = (object?)null
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}