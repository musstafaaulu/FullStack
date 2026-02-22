using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Nexus.Core.Entities;
using Nexus.Data.Contexts;

namespace Nexus.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous] // Login için bilet gerekmez
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            Console.WriteLine($"\n--- Giriş Denemesi: {loginDto.Email} ---");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());

            if (user == null) {
                Console.WriteLine("HATA: Email bulunamadı.");
                return Unauthorized(new { success = false, message = "Email veya şifre hatalı!" });
            }

            if (user.PasswordHash != loginDto.Password) {
                Console.WriteLine($"HATA: Şifre uyuşmuyor. DB: {user.PasswordHash}, Gelen: {loginDto.Password}");
                return Unauthorized(new { success = false, message = "Email veya şifre hatalı!" });
            }

            // Token Üretme
            var tokenHandler = new JwtSecurityTokenHandler();
            var keyString = _configuration["Jwt:Key"] ?? "Bu_Cok_Uzun_Ve_Gizli_Bir_Anahtar_123456789";
            var key = Encoding.UTF8.GetBytes(keyString);
            
            var tokenDescriptor = new SecurityTokenDescriptor {
                Subject = new ClaimsIdentity(new[] {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            Console.WriteLine("BAŞARILI: Giriş yapıldı.");

            return Ok(new { 
                success = true, 
                data = new { token = tokenHandler.WriteToken(token), role = user.Role, fullName = user.FullName } 
            });
        }
    }

    public class LoginDto {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}