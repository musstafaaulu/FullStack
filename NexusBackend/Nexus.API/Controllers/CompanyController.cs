using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Data.Contexts;

namespace Nexus.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyController : TenantBaseController
    {
        private readonly AppDbContext _context;

        public CompanyController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Company
        // AllowAnonymous — Storefront logo/isim gibi bilgileri token olmadan çekebilmeli
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetCompany()
        {
            var companyId = GetCompanyId();

            if (companyId == 0)
                return BadRequest(new { success = false, message = "Şirket kimliği tespit edilemedi. X-Company-Id header veya geçerli Token gönderiniz." });

            var company = await _context.Companies.FindAsync(companyId);
            if (company == null)
                return NotFound(new { success = false, message = "Şirket bulunamadı." });

            return Ok(new { success = true, data = company });
        }

        // PUT: api/Company
        // Sadece giriş yapmış Admin güncelleyebilir
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateCompany([FromBody] CompanyUpdateDto dto)
        {
            var companyId = GetCompanyId();

            if (companyId == 0)
                return BadRequest(new { success = false, message = "Şirket kimliği tespit edilemedi." });

            var company = await _context.Companies.FindAsync(companyId);
            if (company == null)
                return NotFound(new { success = false, message = "Şirket bulunamadı." });

            // Sadece dolu alanları güncelle (Patch mantığı)
            if (!string.IsNullOrWhiteSpace(dto.Name))    company.Name    = dto.Name;
            if (!string.IsNullOrWhiteSpace(dto.Email))   company.Email   = dto.Email;
            if (!string.IsNullOrWhiteSpace(dto.Phone))   company.Phone   = dto.Phone;
            if (!string.IsNullOrWhiteSpace(dto.Address)) company.Address = dto.Address;
            if (!string.IsNullOrWhiteSpace(dto.LogoUrl)) company.LogoUrl = dto.LogoUrl;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Şirket bilgileri güncellendi.", data = company });
        }
    }

    public class CompanyUpdateDto
    {
        public string? Name    { get; set; }
        public string? Email   { get; set; }
        public string? Phone   { get; set; }
        public string? Address { get; set; }
        public string? LogoUrl { get; set; }
    }
}