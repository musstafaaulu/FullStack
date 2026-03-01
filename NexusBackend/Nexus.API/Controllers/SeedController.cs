using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Core.Entities;
using Nexus.Data.Contexts;

namespace Nexus.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SeedController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SeedController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("run")]
        public async Task<IActionResult> Seed()
        {
            var company = await _context.Companies.FirstOrDefaultAsync();
            if (company == null)
                return BadRequest(new { message = "Önce şirket kaydı yap!" });

            var allCats = await _context.Categories
                .Where(c => c.CompanyId == company.Id)
                .ToListAsync();

            if (allCats.Count == 0)
                return BadRequest(new { message = "Kategoriler yok!" });

            Category Get(string name) => allCats.FirstOrDefault(c => c.Name == name) ?? allCats.First();

            var products = new List<Product>
            {
                new Product { Name = "iPhone 15 Pro", Price = 62999, Stock = 25, Category = "Telefon & Aksesuar", CategoryId = Get("Telefon & Aksesuar").Id, ImageUrl = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop", Description = "Apple'ın en gelişmiş akıllı telefonu. A17 Pro çip, titanyum tasarım.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Samsung Galaxy S24", Price = 45999, Stock = 30, Category = "Telefon & Aksesuar", CategoryId = Get("Telefon & Aksesuar").Id, ImageUrl = "https://images.unsplash.com/photo-1706439269565-5c3e92fd3d1d?w=400&h=400&fit=crop", Description = "Android'in zirvesi. Galaxy AI ile güçlendirilmiş.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "MacBook Air M3", Price = 89999, Stock = 15, Category = "Bilgisayar & Tablet", CategoryId = Get("Bilgisayar & Tablet").Id, ImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop", Description = "18 saate kadar pil ömrü, M3 çip ile inanılmaz performans.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "iPad Pro 12.9\"", Price = 54999, Stock = 20, Category = "Bilgisayar & Tablet", CategoryId = Get("Bilgisayar & Tablet").Id, ImageUrl = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop", Description = "M4 çipli ultra ince tablet. Yaratıcılar için tasarlandı.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Sony WH-1000XM5", Price = 12999, Stock = 40, Category = "Elektronik", CategoryId = Get("Elektronik").Id, ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", Description = "Sektörün en iyi gürültü önleme kulaklığı.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Samsung 4K OLED TV 55\"", Price = 34999, Stock = 12, Category = "Elektronik", CategoryId = Get("Elektronik").Id, ImageUrl = "https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=400&h=400&fit=crop", Description = "Sinemanın büyüsünü evinize taşıyın.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Apple Watch Series 9", Price = 18999, Stock = 22, Category = "Elektronik", CategoryId = Get("Elektronik").Id, ImageUrl = "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop", Description = "Sağlık takibi ve akıllı bildirimler için en iyi akıllı saat.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "GoPro Hero 12", Price = 14999, Stock = 18, Category = "Elektronik", CategoryId = Get("Elektronik").Id, ImageUrl = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop", Description = "5.3K video, su geçirmez macera kamerası.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Nike Air Max 270", Price = 3299, Stock = 55, Category = "Ayakkabı & Çanta", CategoryId = Get("Ayakkabı & Çanta").Id, ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", Description = "En büyük Air birimi ile maksimum konfor.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Adidas Ultraboost 23", Price = 4199, Stock = 45, Category = "Ayakkabı & Çanta", CategoryId = Get("Ayakkabı & Çanta").Id, ImageUrl = "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop", Description = "Koşucular için tasarlanmış premium koşu ayakkabısı.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Levi's 501 Original", Price = 1899, Stock = 80, Category = "Erkek Giyim", CategoryId = Get("Erkek Giyim").Id, ImageUrl = "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&h=400&fit=crop", Description = "Dünyaca ünlü klasik straight fit kot pantolon.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Tommy Hilfiger Polo", Price = 1299, Stock = 60, Category = "Erkek Giyim", CategoryId = Get("Erkek Giyim").Id, ImageUrl = "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop", Description = "Klasik Amerikan tarzı polo yaka tişört.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Zara Midi Elbise", Price = 899, Stock = 35, Category = "Kadın Giyim", CategoryId = Get("Kadın Giyim").Id, ImageUrl = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop", Description = "Zarif midi boy elbise. Her ortama uygun.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "H&M Oversize Blazer", Price = 1199, Stock = 28, Category = "Kadın Giyim", CategoryId = Get("Kadın Giyim").Id, ImageUrl = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop", Description = "Trend oversize blazer ceket. Hem casual hem şık.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Decathlon Koşu Seti", Price = 699, Stock = 70, Category = "Spor & Outdoor", CategoryId = Get("Spor & Outdoor").Id, ImageUrl = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop", Description = "Nefes alan kumaş, koşu için ideal kombin.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Nike Dri-FIT Tayt", Price = 1099, Stock = 50, Category = "Spor & Outdoor", CategoryId = Get("Spor & Outdoor").Id, ImageUrl = "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop", Description = "Nem yönetim teknolojisi ile performansını artır.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Dyson V15 Süpürge", Price = 18999, Stock = 18, Category = "Ev & Yaşam", CategoryId = Get("Ev & Yaşam").Id, ImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop", Description = "Lazer ile toz tespiti, güçlü emişi ile eşsiz temizlik.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Philips Hue Akıllı Ampul", Price = 2499, Stock = 42, Category = "Ev & Yaşam", CategoryId = Get("Ev & Yaşam").Id, ImageUrl = "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop", Description = "16 milyon renk seçeneği ile akıllı ev aydınlatması.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Tefal Airfryer XL", Price = 4799, Stock = 22, Category = "Mutfak & Yemek", CategoryId = Get("Mutfak & Yemek").Id, ImageUrl = "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop", Description = "Yağsız pişirme ile sağlıklı ve lezzetli yemekler.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Nespresso Vertuo Pop", Price = 3299, Stock = 30, Category = "Mutfak & Yemek", CategoryId = Get("Mutfak & Yemek").Id, ImageUrl = "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=400&fit=crop", Description = "Kapsüllü kahve makinesi. Mükemmel crema garantisi.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Sapiens - Yuval Noah Harari", Price = 129, Stock = 100, Category = "Kitap & Kırtasiye", CategoryId = Get("Kitap & Kırtasiye").Id, ImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop", Description = "İnsanlığın kısa tarihi. Dünyanın en çok okunan kitabı.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Moleskine Defter Seti", Price = 349, Stock = 90, Category = "Kitap & Kırtasiye", CategoryId = Get("Kitap & Kırtasiye").Id, ImageUrl = "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop", Description = "Yaratıcı düşünceler için premium defter.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "LEGO Technic Araba", Price = 2799, Stock = 25, Category = "Oyuncak & Hobi", CategoryId = Get("Oyuncak & Hobi").Id, ImageUrl = "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop", Description = "842 parçalı gerçekçi araba seti. 10+ yaş.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "PlayStation 5 Joystick", Price = 3299, Stock = 35, Category = "Oyuncak & Hobi", CategoryId = Get("Oyuncak & Hobi").Id, ImageUrl = "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop", Description = "DualSense haptic feedback ile oyun deneyimini hisset.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "L'Oreal Serum Seti", Price = 899, Stock = 55, Category = "Kozmetik & Bakım", CategoryId = Get("Kozmetik & Bakım").Id, ImageUrl = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop", Description = "Hyaluronik asit içerikli cilt bakım serumu.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Garnier Micellar Su", Price = 179, Stock = 120, Category = "Kozmetik & Bakım", CategoryId = Get("Kozmetik & Bakım").Id, ImageUrl = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop", Description = "Hassas ciltler için makyaj temizleyici.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Bosch Araba Bakım Seti", Price = 1499, Stock = 20, Category = "Otomotiv", CategoryId = Get("Otomotiv").Id, ImageUrl = "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop", Description = "Profesyonel araç bakım ürünleri seti.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Michelin Lastik 205/55 R16", Price = 2899, Stock = 16, Category = "Otomotiv", CategoryId = Get("Otomotiv").Id, ImageUrl = "https://images.unsplash.com/photo-1558979158-65a1eaa08691?w=400&h=400&fit=crop", Description = "Her mevsim üstün performans ve güvenlik.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Bahçe Sulama Seti", Price = 599, Stock = 40, Category = "Bahçe & Yapı Market", CategoryId = Get("Bahçe & Yapı Market").Id, ImageUrl = "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop", Description = "Damla sulama sistemi. Kolay kurulum.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
                new Product { Name = "Black+Decker Matkap", Price = 1899, Stock = 28, Category = "Bahçe & Yapı Market", CategoryId = Get("Bahçe & Yapı Market").Id, ImageUrl = "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop", Description = "18V şarjlı profesyonel delme vidalama makinesi.", CompanyId = company.Id, CreatedAt = DateTime.UtcNow },
            };

            _context.Products.AddRange(products);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = $"{products.Count} ürün eklendi!", products = products.Count });
        }
    }
}