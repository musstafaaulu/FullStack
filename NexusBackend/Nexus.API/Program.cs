using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Nexus.API.Middleware;
using Nexus.Data.Contexts;
using Serilog;
using System.Text;

// ── SERILOG KURULUMU ──────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File("Logs/nexus-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();
// ──────────────────────────────────────────────────────────

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog(); // ✅ Host'a Serilog bağla

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ✅ Swagger JWT desteği
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Nexus.API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Bearer {token}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

builder.Services.AddAutoMapper(typeof(Nexus.API.Mapping.MappingProfile));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes("nexus_cok_gizli_ve_uzun_bir_guvenlik_anahtari_123456789!")),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddAuthorization();

// ✅ CORS — 4200 ve 4300 her ikisine de izin ver
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:4300")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseStaticFiles();
app.UseMiddleware<ExceptionMiddleware>();
app.UseSerilogRequestLogging(); // ✅ Her HTTP isteği loglanır

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ── SEED DATA ──────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    if (!db.Companies.Any())
    {
        db.Companies.Add(new Nexus.Core.Entities.Company
        {
            Name     = "Ufuk Ayakkabı",
            Slug     = "ufuk-ayakkabi",
            Email    = "info@ufukayakkabi.com",
            Phone    = "05001234567",
            Address  = "İstanbul",
            LogoUrl  = "",
            Website  = "",
            IsActive = true
        });
        db.SaveChanges();
    }

    var company = db.Companies.First();

    if (!db.Users.Any(u => u.Email == "admin@nexus.com"))
    {
        db.Users.Add(new Nexus.Core.Entities.User
        {
            FullName     = "Admin User",
            Email        = "admin@nexus.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
            Role         = "Admin",
            CompanyId    = company.Id
        });
        db.SaveChanges();
    }
}
// ───────────────────────────────────────────────────────────

app.Run();