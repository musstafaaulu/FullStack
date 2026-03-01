using Microsoft.AspNetCore.Mvc;

namespace Nexus.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<UploadController> _logger;

        public UploadController(IWebHostEnvironment env, ILogger<UploadController> logger)
        {
            _env    = env;
            _logger = logger;
        }

        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { success = false, message = "Geçerli bir dosya seçin." });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { success = false, message = "Sadece resim dosyaları kabul edilir." });

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { success = false, message = "Dosya 5MB'dan büyük olamaz." });

            try
            {
                var webRoot    = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var uploadsDir = Path.Combine(webRoot, "uploads");

                if (!Directory.Exists(uploadsDir))
                    Directory.CreateDirectory(uploadsDir);

                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                _logger.LogInformation("Dosya yüklendi: {Path}", filePath);

                return Ok(new { success = true, url = $"/uploads/{fileName}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Dosya yükleme hatası");
                return StatusCode(500, new { success = false, message = $"Sunucu hatası: {ex.Message}" });
            }
        }
    }
}