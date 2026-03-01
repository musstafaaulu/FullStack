using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Data.Contexts;
using System.Security.Claims;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Nexus.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCompanyId()
        {
            if (Request.Headers.TryGetValue("X-Company-Id", out var headerValue) &&
                int.TryParse(headerValue, out int headerCompanyId) &&
                headerCompanyId > 0)
            {
                return headerCompanyId;
            }

            if (int.TryParse(User.FindFirst("CompanyId")?.Value, out int jwtCompanyId) && jwtCompanyId > 0)
            {
                return jwtCompanyId;
            }

            return 0;
        }

        private bool IsSuperAdmin() =>
            User.FindFirst(ClaimTypes.Role)?.Value == "Super Admin";

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string? category = null,
            [FromQuery] string? search = null)
        {
            var query = _context.Products.Include(p => p.Brand).AsQueryable();

            var companyId = GetCompanyId();
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role == "Super Admin")
            {
                // Super Admin tüm şirketlerin ürünlerini görür
            }
            else if (companyId > 0)
            {
                query = query.Where(p => p.CompanyId == companyId);
            }
            else
            {
                var firstCompany = await _context.Companies.FirstOrDefaultAsync(c => c.Slug != "nexus-platform");
                if (firstCompany != null)
                {
                    query = query.Where(p => p.CompanyId == firstCompany.Id);
                }
            }

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category == category);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name.ToLower().Contains(search.ToLower()));
            }

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.Stock,
                    p.Category,
                    img = p.ImageUrl,
                    p.ImageUrl,
                    p.Description,
                    p.CreatedAt,
                    p.BrandId,
                    p.CategoryId,
                    p.CompanyId,
                    brandName = p.Brand != null ? p.Brand.Name : null
                })
                .ToListAsync();

            return Ok(new { success = true, data = new { items, total, page, pageSize } });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var companyId = GetCompanyId();
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            var query = _context.Products.Include(p => p.Brand).AsQueryable();

            if (role != "Super Admin" && companyId > 0)
            {
                query = query.Where(p => p.CompanyId == companyId);
            }

            // ✅ Select projection ile döngü engellendi
            var product = await query
                .Where(p => p.Id == id)
                .Select(p => new {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.Stock,
                    p.Category,
                    p.ImageUrl,
                    p.Description,
                    p.CreatedAt,
                    p.BrandId,
                    p.CategoryId,
                    p.CompanyId,
                    brandName = p.Brand != null ? p.Brand.Name : null
                })
                .FirstOrDefaultAsync();

            if (product == null)
                return NotFound(new { success = false, message = "Ürün bulunamadı veya erişim yetkiniz yok." });

            return Ok(new { success = true, data = product });
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] Nexus.Core.Entities.Product dto)
        {
            var companyId = GetCompanyId();

            if (companyId == 0)
            {
                return BadRequest(new { success = false, message = "Ürünün ekleneceği şirket tespit edilemedi." });
            }

            dto.CompanyId = companyId;
            dto.CreatedAt = DateTime.UtcNow;

            _context.Products.Add(dto);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = dto });
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] Nexus.Core.Entities.Product dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            if (!IsSuperAdmin() && product.CompanyId != GetCompanyId())
                return Forbid();

            product.Name = dto.Name;
            product.Price = dto.Price;
            product.Stock = dto.Stock;
            product.Category = dto.Category;
            product.ImageUrl = dto.ImageUrl ?? product.ImageUrl;
            product.Description = dto.Description;
            product.BrandId = dto.BrandId;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = product });
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            if (!IsSuperAdmin() && product.CompanyId != GetCompanyId())
                return Forbid();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Ürün silindi." });
        }
    }
}