using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Core.Entities;
using Nexus.Data.Contexts;
using System.Security.Claims;

namespace Nexus.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : TenantBaseController
    {
        private readonly AppDbContext _context;

        public CommentsController(AppDbContext context)
        {
            _context = context;
        }

        private bool IsSuperAdmin() =>
            User.FindFirst(ClaimTypes.Role)?.Value == "Super Admin";

        // GET: api/Comments/Product/5
        // Storefront: ürüne ait ONAYLI yorumları getirir (token gereksiz)
        [HttpGet("Product/{productId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByProduct(int productId)
        {
            var companyId = GetCompanyId();

            var query = _context.Comments
                .Where(c => c.ProductId == productId && c.Status == "Onaylandı")
                .AsQueryable();

            if (companyId > 0)
                query = query.Where(c => c.CompanyId == companyId);

            var comments = await query
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new {
                    c.Id,
                    c.UserName,
                    c.Text,
                    c.Rating,
                    c.CreatedAt
                })
                .ToListAsync();

            return Ok(new { success = true, data = comments });
        }

        // GET: api/Comments
        // Admin Panel: tüm yorumları (onaylı/beklemede/reddedilmiş) getirir
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllForAdmin(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string? status = null)
        {
            var companyId = GetCompanyId();
            var query = _context.Comments.AsQueryable();

            if (IsSuperAdmin())
            {
                // Super Admin tüm şirketlerin yorumlarını görür
            }
            else
            {
                if (companyId == 0) return Forbid();
                query = query.Where(c => c.CompanyId == companyId);
            }

            // Durum filtresi (Beklemede / Onaylandı / Reddedildi)
            if (!string.IsNullOrEmpty(status))
                query = query.Where(c => c.Status == status);

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new {
                    c.Id,
                    c.ProductId,
                    c.UserName,
                    c.Text,
                    c.Rating,
                    c.Status,
                    c.CreatedAt,
                    c.CompanyId
                })
                .ToListAsync();

            return Ok(new { success = true, data = new { items, total, page, pageSize } });
        }

        // POST: api/Comments
        // Storefront: yeni yorum ekle (giriş yapmış kullanıcı)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CommentCreateDto dto)
        {
            var companyId = GetCompanyId();
            var userId    = GetUserId();

            if (companyId == 0)
                return BadRequest(new { success = false, message = "Şirket kimliği tespit edilemedi." });

            // Ürünün bu şirkete ait olduğunu doğrula
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null || product.CompanyId != companyId)
                return BadRequest(new { success = false, message = "Geçersiz ürün." });

            var comment = new Comment
            {
                ProductId = dto.ProductId,
                UserId    = userId,
                UserName  = dto.UserName,
                Text      = dto.Text,
                Rating    = dto.Rating,
                Status    = "Beklemede",   // Yeni yorumlar beklemede başlar
                CompanyId = companyId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Yorumunuz alındı, onaylandıktan sonra yayınlanacaktır." });
        }

        // PUT: api/Comments/5/status
        // Admin Panel: yorum durumunu güncelle (Onaylandı / Reddedildi / Beklemede)
        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] CommentStatusDto dto)
        {
            var validStatuses = new[] { "Beklemede", "Onaylandı", "Reddedildi" };
            if (!validStatuses.Contains(dto.Status))
                return BadRequest(new { success = false, message = "Geçersiz durum. (Beklemede / Onaylandı / Reddedildi)" });

            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
                return NotFound(new { success = false, message = "Yorum bulunamadı." });

            // Yetki kontrolü: Super Admin veya yorumun sahibi şirket
            if (!IsSuperAdmin() && comment.CompanyId != GetCompanyId())
                return Forbid();

            comment.Status = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = $"Yorum durumu '{dto.Status}' olarak güncellendi." });
        }

        // DELETE: api/Comments/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
                return NotFound(new { success = false, message = "Yorum bulunamadı." });

            if (!IsSuperAdmin() && comment.CompanyId != GetCompanyId())
                return Forbid();

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Yorum silindi." });
        }
    }

    // ─── DTOs ───────────────────────────────────────────────────────────────────

    public class CommentCreateDto
    {
        public int    ProductId { get; set; }
        public string UserName  { get; set; } = string.Empty;
        public string Text      { get; set; } = string.Empty;
        public int    Rating    { get; set; } = 5;
    }

    public class CommentStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}