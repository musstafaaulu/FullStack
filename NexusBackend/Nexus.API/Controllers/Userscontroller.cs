using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Core.Entities;
using Nexus.Data.Contexts;
namespace Nexus.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : TenantBaseController
    {
        private readonly AppDbContext _context;
        public UsersController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var companyId = GetCompanyId();
            var users = await _context.Users
                .Where(u => u.CompanyId == companyId)
                .Select(u => new { u.Id, u.FullName, u.Email, u.Role, u.RegisteredAt })
                .ToListAsync();
            return Ok(new { success = true, data = users });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var companyId = GetCompanyId();
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.CompanyId == companyId);
            if (user == null) return NotFound();
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }
}