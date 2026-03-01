using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Core.Entities;
using Nexus.Data.Contexts;
using System.Security.Claims;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Nexus.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : TenantBaseController
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        private bool IsSuperAdmin() =>
            User.FindFirst(ClaimTypes.Role)?.Value == "Super Admin";

        [HttpGet]
        public async Task<IActionResult> GetOrders(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string? search = null,
            [FromQuery] string? status = null)
        {
            var companyId = GetCompanyId();
            var query = _context.Orders.AsQueryable();

            if (!IsSuperAdmin())
            {
                if (companyId == 0) return Forbid();
                query = query.Where(o => o.CompanyId == companyId);
            }

            if (!string.IsNullOrEmpty(status))
                query = query.Where(o => o.Status == status);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(o => o.Id.ToString().Contains(search));

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new { success = true, data = new { items, total, page, pageSize } });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var companyId = GetCompanyId();
            var query = _context.Orders.AsQueryable();

            if (!IsSuperAdmin())
            {
                if (companyId == 0) return Forbid();
                query = query.Where(o => o.CompanyId == companyId);
            }

            var order = await query.FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound(new { success = false, message = "Sipariş bulunamadı veya erişim yetkiniz yok." });

            return Ok(new { success = true, data = order });
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
        {
            var companyId = GetCompanyId();

            if (companyId == 0)
                return BadRequest(new { success = false, message = "Şirket kimliği tespit edilemedi." });

            // ✅ Sipariş içindeki her ürünün stokunu düş
            if (dto.Items != null && dto.Items.Any())
            {
                foreach (var item in dto.Items)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product != null)
                    {
                        // Math.Max ile stok 0'ın altına inmez
                        product.Stock = Math.Max(0, product.Stock - item.Quantity);
                    }
                }
            }

            var order = new Order
            {
                UserName      = dto.UserName,
                TotalPrice    = dto.TotalPrice,
                Status        = "Beklemede",
                PaymentMethod = dto.PaymentMethod,
                CompanyId     = companyId,
                CreatedAt     = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = order });
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            var companyId = GetCompanyId();
            var query = _context.Orders.AsQueryable();

            if (!IsSuperAdmin())
            {
                if (companyId == 0) return Forbid();
                query = query.Where(o => o.CompanyId == companyId);
            }

            var order = await query.FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound(new { success = false, message = "Sipariş bulunamadı." });

            order.Status = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Sipariş durumu güncellendi.", data = order });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var companyId = GetCompanyId();
            var query = _context.Orders.AsQueryable();

            if (!IsSuperAdmin())
            {
                if (companyId == 0) return Forbid();
                query = query.Where(o => o.CompanyId == companyId);
            }

            var order = await query.FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound(new { success = false, message = "Sipariş bulunamadı." });

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Sipariş başarıyla silindi." });
        }
    }

    // ── DTO'lar ──────────────────────────────────────────────────────────────────

    public class OrderCreateDto
    {
        public string? UserName      { get; set; }
        public decimal TotalPrice    { get; set; }
        public string? PaymentMethod { get; set; }
        public List<OrderItemDto>? Items { get; set; }
    }

    public class OrderItemDto
    {
        public int ProductId { get; set; }
        public int Quantity  { get; set; }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}