using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Core.Entities;
using Nexus.Data.Contexts;

namespace Nexus.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Sadece giriş yapanlar ürün yönetebilir
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous] // Ürünleri herkes görebilsin
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Products.ToListAsync();
            return Ok(new { success = true, data = new { data = products } });
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            // Backend terminalinde görelim
            Console.WriteLine($"Yeni ürün geliyor: {product.Name}");

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Ürün başarıyla eklendi" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }
}