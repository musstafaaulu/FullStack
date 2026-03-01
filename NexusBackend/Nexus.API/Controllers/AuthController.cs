using Nexus.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Core.Entities;
using Nexus.Data.Contexts;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;

namespace Nexus.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        private int GetCompanyIdFromHeader()
        {
            if (Request.Headers.TryGetValue("X-Company-Id", out var headerValue) &&
                int.TryParse(headerValue, out int companyId) && companyId > 0)
                return companyId;
            return 0;
        }

        private int GetCompanyIdFromToken()
        {
            var claim = User.FindFirst("CompanyId");
            if (claim != null && int.TryParse(claim.Value, out int companyId))
                return companyId;
            return 0;
        }

        // POST: api/Auth/register — Şirket + Admin kaydı
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] CompanyRegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
                return BadRequest(new { success = false, message = "Bu e-posta zaten kayıtlı!" });

            var slug = GenerateSlug(dto.CompanyName);
            if (await _context.Companies.AnyAsync(c => c.Slug == slug))
                slug = $"{slug}-{new Random().Next(100, 999)}";

            var company = new Company
            {
                Name = dto.CompanyName,
                Slug = slug,
                Email = dto.Email,
                CreatedAt = DateTime.UtcNow
            };
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Admin",
                CompanyId = company.Id,
                RegisteredAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Şirket ve admin hesabı oluşturuldu!", companySlug = slug });
        }

        // POST: api/Auth/add-employee — Mevcut şirkete çalışan ekle
        [HttpPost("add-employee")]
        [Authorize(Roles = "Admin,Super Admin")]
        public async Task<IActionResult> AddEmployee([FromBody] AddEmployeeDto dto)
        {
            var companyId = GetCompanyIdFromToken();
            if (companyId == 0)
                return BadRequest(new { success = false, message = "Şirket bilgisi alınamadı." });

            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
                return BadRequest(new { success = false, message = "Bu e-posta zaten kayıtlı!" });

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role ?? "Employee",
                CompanyId = companyId,
                RegisteredAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Çalışan başarıyla eklendi!" });
        }

        // POST: api/Auth/register-superadmin
        [HttpPost("register-superadmin")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterSuperAdmin([FromBody] SuperAdminRegisterDto dto)
        {
            if (dto.SecretKey != "nexus_platform_2025")
                return Unauthorized(new { success = false, message = "Geçersiz platform anahtarı!" });

            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
                return BadRequest(new { success = false, message = "Bu e-posta zaten kayıtlı!" });

            var platformCompany = await _context.Companies.FirstOrDefaultAsync(c => c.Slug == "nexus-platform");
            if (platformCompany == null)
            {
                platformCompany = new Company
                {
                    Name = "Nexus Platform",
                    Slug = "nexus-platform",
                    Email = dto.Email,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Companies.Add(platformCompany);
                await _context.SaveChangesAsync();
            }

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Super Admin",
                CompanyId = platformCompany.Id,
                RegisteredAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Super Admin hesabı oluşturuldu!" });
        }

        // POST: api/Auth/register-customer
        [HttpPost("register-customer")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterCustomer([FromBody] CustomerRegisterDto dto)
        {
            var companyId = GetCompanyIdFromHeader();
            Company? targetCompany = null;

            if (companyId > 0)
            {
                targetCompany = await _context.Companies.FindAsync(companyId);
                if (targetCompany == null)
                    return BadRequest(new { success = false, message = "Belirtilen şirket bulunamadı." });
            }
            else
            {
                targetCompany = await _context.Companies
                    .FirstOrDefaultAsync(c => c.Slug != "nexus-platform");
                if (targetCompany == null)
                    return BadRequest(new { success = false, message = "Henüz kayıtlı şirket yok." });
            }

            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
                return BadRequest(new { success = false, message = "Bu e-posta zaten kayıtlı!" });

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Customer",
                CompanyId = targetCompany.Id,
                RegisteredAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Hesabınız oluşturuldu! Giriş yapabilirsiniz." });
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {
            var user = await _context.Users
                .Include(u => u.Company)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new { success = false, message = "E-posta veya şifre hatalı!" });

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                success = true,
                data = new
                {
                    token,
                    fullName     = user.FullName,
                    email        = user.Email,
                    role         = user.Role,
                    companyId    = user.CompanyId,
                    companyName  = user.Company?.Name,
                    isSuperAdmin = user.Role == "Super Admin"
                }
            });
        }

        // POST: api/Auth/register-company
        [HttpPost("register-company")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterCompany([FromBody] RegisterCompanyDto dto)
        {
            if (await _context.Companies.AnyAsync(c => c.Email == dto.CompanyEmail))
                return BadRequest(new { success = false, message = "Bu e-posta ile kayıtlı bir şirket zaten var." });

            if (await _context.Users.AnyAsync(u => u.Email == dto.OwnerEmail))
                return BadRequest(new { success = false, message = "Bu e-posta ile kayıtlı bir kullanıcı zaten var." });

            var slug = GenerateSlug(dto.CompanyName);
            if (await _context.Companies.AnyAsync(c => c.Slug == slug))
                slug = $"{slug}-{new Random().Next(100, 999)}";

            var company = new Company
            {
                Name      = dto.CompanyName,
                Slug      = slug,
                Email     = dto.CompanyEmail,
                Phone     = dto.CompanyPhone   ?? "",
                Address   = dto.CompanyAddress ?? "",
                Website   = dto.CompanyWebsite ?? "",
                CreatedAt = DateTime.UtcNow
            };
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            var user = new User
            {
                FullName     = dto.OwnerFullName,
                Email        = dto.OwnerEmail.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.OwnerPassword),
                Role         = "Admin",
                CompanyId    = company.Id,
                RegisteredAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Şirket ve admin hesabı başarıyla oluşturuldu.",
                data = new { companyId = company.Id, companyName = company.Name }
            });
        }

        // ✅ POST: api/Auth/change-password — Şifre değiştir
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            // Token'dan kullanıcı e-postasını al
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
                return Unauthorized(new { success = false, message = "Oturum bilgisi alınamadı." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return NotFound(new { success = false, message = "Kullanıcı bulunamadı." });

            // ✅ Mevcut şifre doğru mu?
            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return BadRequest(new { success = false, message = "Mevcut şifre hatalı." });

            // ✅ Yeni şifreyi hashle ve kaydet
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Şifreniz başarıyla güncellendi." });
        }

        private string GenerateJwtToken(User user)
        {
            var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                "nexus_cok_gizli_ve_uzun_bir_guvenlik_anahtari_123456789!"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email,          user.Email),
                new Claim(ClaimTypes.Role,           user.Role),
                new Claim("CompanyId",               user.CompanyId.ToString())
            };

            var token = new JwtSecurityToken(
                claims:             claims,
                expires:            DateTime.Now.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateSlug(string name)
        {
            return name.ToLower()
                .Replace(" ", "-")
                .Replace("ş", "s").Replace("ç", "c").Replace("ğ", "g")
                .Replace("ü", "u").Replace("ö", "o").Replace("ı", "i");
        }
    }

    // ✅ Şifre değiştirme DTO
    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword     { get; set; } = string.Empty;
    }
}