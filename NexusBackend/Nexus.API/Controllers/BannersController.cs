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
    public class BannersController : TenantBaseController
    {
        private readonly AppDbContext _context;

        public BannersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Banners — Herkes görebilir (storefront için)
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var companyId = GetCompanyId();

            List<Banner> banners;

            if (companyId > 0)
            {
                banners = await _context.Banners
                    .Where(b => b.CompanyId == companyId && b.IsActive)
                    .OrderBy(b => b.Order)
                    .ToListAsync();
            }
            else
            {
                var firstCompany = await _context.Companies.FirstOrDefaultAsync();
                banners = firstCompany != null
                    ? await _context.Banners
                        .Where(b => b.CompanyId == firstCompany.Id && b.IsActive)
                        .OrderBy(b => b.Order)
                        .ToListAsync()
                    : new List<Banner>();
            }

            return Ok(new { success = true, data = banners });
        }

        // POST: api/Banners — Sadece Admin
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] Banner dto)
        {
            var companyId = GetCompanyId();
            if (companyId <= 0)
                return BadRequest(new { success = false, message = "Şirket bilgisi bulunamadı." });

            var banner = new Banner
            {
                Title    = dto.Title,
                ImageUrl = dto.ImageUrl,
                Link     = dto.Link ?? "",
                IsActive = dto.IsActive,
                Order    = dto.Order,
                CompanyId = companyId
            };

            _context.Banners.Add(banner);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Banner eklendi.", data = banner });
        }

        // PUT: api/Banners/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] Banner dto)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null)
                return NotFound(new { success = false, message = "Banner bulunamadı." });

            banner.Title    = dto.Title ?? banner.Title;
            banner.ImageUrl = dto.ImageUrl ?? banner.ImageUrl;
            banner.Link     = dto.Link ?? banner.Link;
            banner.IsActive = dto.IsActive;
            banner.Order    = dto.Order;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Banner güncellendi.", data = banner });
        }

        // DELETE: api/Banners/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null)
                return NotFound(new { success = false, message = "Banner bulunamadı." });

            _context.Banners.Remove(banner);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Banner silindi." });
        }
    }
}