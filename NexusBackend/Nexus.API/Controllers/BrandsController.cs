using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.API.DTOs;
using Nexus.Core.Entities;
using Nexus.Data.Contexts;

namespace Nexus.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BrandsController : TenantBaseController
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public BrandsController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetBrands()
        {
            var companyId = GetCompanyId();
            var brands = await _context.Brands
                .Where(b => b.CompanyId == companyId)
                .ToListAsync();

            return Ok(new { success = true, data = _mapper.Map<List<BrandResponseDto>>(brands) });
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateBrand([FromBody] BrandCreateDto dto)
        {
            var brand = _mapper.Map<Brand>(dto);
            brand.CompanyId = GetCompanyId();

            _context.Brands.Add(brand);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Marka eklendi", data = _mapper.Map<BrandResponseDto>(brand) });
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateBrand(int id, [FromBody] BrandCreateDto dto)
        {
            var companyId = GetCompanyId();
            var brand = await _context.Brands
                .FirstOrDefaultAsync(b => b.Id == id && b.CompanyId == companyId);

            if (brand == null) return NotFound(new { success = false, message = "Marka bulunamadı." });

            _mapper.Map(dto, brand);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Marka güncellendi" });
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteBrand(int id)
        {
            var companyId = GetCompanyId();
            var brand = await _context.Brands
                .FirstOrDefaultAsync(b => b.Id == id && b.CompanyId == companyId);

            if (brand == null) return NotFound(new { success = false, message = "Marka bulunamadı." });

            _context.Brands.Remove(brand);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Marka silindi" });
        }
    }
}