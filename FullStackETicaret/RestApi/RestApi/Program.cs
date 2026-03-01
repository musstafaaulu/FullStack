using Microsoft.EntityFrameworkCore;
using RestApi.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. In-Memory Database (Test için en hızlısı)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("UluEticaretDB"));

// 2. CORS Ayarı (Angular erişimi için zorunlu)
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAngular",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// İlk açılışta veritabanına bir kaç örnek veri atalım (p3 kuralı için)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (!context.Products.Any())
    {
        context.Products.Add(new RestApi.Models.Product { Name = "iPhone 15", Category = "Elektronik", Price = 65000, Stock = 10 });
context.Users.Add(new RestApi.Models.User { FullName = "Mustafa Ulu", Email = "mustafa@ulu.com", Role = "SuperAdmin" });
        context.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");
app.UseAuthorization();
app.MapControllers();
app.Run();