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
    public class CategoriesController : TenantBaseController
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        private bool IsAdminOrAbove()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            return role == "Super Admin" || role == "Admin";
        }

        // GET: api/Categories
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var companyId = GetCompanyId();
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            List<Category> categories;

            if (role == "Super Admin")
            {
                categories = await _context.Categories
                    .Include(c => c.Company)
                    .Where(c => c.Company.Slug != "nexus-platform")
                    .GroupBy(c => c.Name)
                    .Select(g => g.First())
                    .ToListAsync();
            }
            else if (companyId > 0)
            {
                categories = await _context.Categories
                    .Where(c => c.CompanyId == companyId)
                    .ToListAsync();
            }
            else
            {
                var firstCompany = await _context.Companies
                    .FirstOrDefaultAsync(c => c.Slug != "nexus-platform");
                categories = firstCompany != null
                    ? await _context.Categories
                        .Where(c => c.CompanyId == firstCompany.Id)
                        .ToListAsync()
                    : new List<Category>();
            }

            return Ok(new { success = true, data = categories });
        }

        // POST: api/Categories
        // ✅ Admin ve Super Admin ekleyebilir
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] Category dto)
        {
            if (!IsAdminOrAbove())
                return StatusCode(403, new { success = false, message = "Kategori eklemek için Admin yetkisi gereklidir." });

            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { success = false, message = "Kategori adı boş olamaz." });

            var companyId = GetCompanyId();

            // Super Admin ise tüm şirketlere ekle, Admin ise sadece kendi şirketine
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role == "Super Admin")
            {
                var companies = await _context.Companies
                    .Where(c => c.Slug != "nexus-platform")
                    .ToListAsync();

                if (!companies.Any())
                    return BadRequest(new { success = false, message = "Eklenebilecek şirket bulunamadı." });

                int addedCount = 0;
                foreach (var company in companies)
                {
                    var exists = await _context.Categories
                        .AnyAsync(c => c.Name == dto.Name && c.CompanyId == company.Id);
                    if (!exists)
                    {
                        _context.Categories.Add(new Category
                        {
                            Name = dto.Name,
                            Description = dto.Description,
                            CompanyId = company.Id
                        });
                        addedCount++;
                    }
                }
                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = $"'{dto.Name}' kategorisi {addedCount} şirkete eklendi." });
            }
            else
            {
                // Admin — sadece kendi şirketine ekle
                if (companyId <= 0)
                    return BadRequest(new { success = false, message = "Şirket bilgisi bulunamadı." });

                var exists = await _context.Categories
                    .AnyAsync(c => c.Name == dto.Name && c.CompanyId == companyId);
                if (exists)
                    return BadRequest(new { success = false, message = "Bu kategori zaten mevcut." });

                _context.Categories.Add(new Category
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    CompanyId = companyId
                });
                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = $"'{dto.Name}' kategorisi eklendi." });
            }
        }

        // PUT: api/Categories/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] Category dto)
        {
            if (!IsAdminOrAbove())
                return StatusCode(403, new { success = false, message = "Kategori güncellemek için Admin yetkisi gereklidir." });

            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound(new { success = false, message = "Kategori bulunamadı." });

            category.Name = dto.Name ?? category.Name;
            category.Description = dto.Description ?? category.Description;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Kategori güncellendi.", data = category });
        }

        // DELETE: api/Categories/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            if (!IsAdminOrAbove())
                return StatusCode(403, new { success = false, message = "Kategori silmek için Admin yetkisi gereklidir." });

            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound(new { success = false, message = "Kategori bulunamadı." });

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Kategori silindi." });
        }
    }
}