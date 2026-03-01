using Microsoft.EntityFrameworkCore;
using Nexus.Core.Entities;

namespace Nexus.Data.Contexts
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Company> Companies { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Banner> Banners { get; set; } // ✅ Banner eklendi

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Company>()
                .HasIndex(c => c.Slug).IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email).IsUnique();

            modelBuilder.Entity<User>()
                .HasOne(u => u.Company).WithMany(c => c.Users)
                .HasForeignKey(u => u.CompanyId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Product>()
                .HasOne(p => p.Company).WithMany(c => c.Products)
                .HasForeignKey(p => p.CompanyId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Product>()
                .HasOne(p => p.Brand).WithMany(b => b.Products)
                .HasForeignKey(p => p.BrandId).OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Product>()
                .HasOne(p => p.CategoryNav).WithMany()
                .HasForeignKey(p => p.CategoryId).OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Brand>()
                .HasOne(b => b.Company).WithMany()
                .HasForeignKey(b => b.CompanyId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.Company).WithMany(c => c.Orders)
                .HasForeignKey(o => o.CompanyId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Category>()
                .HasOne(cat => cat.Company).WithMany(c => c.Categories)
                .HasForeignKey(cat => cat.CompanyId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>()
                .HasOne(cm => cm.Company).WithMany(c => c.Comments)
                .HasForeignKey(cm => cm.CompanyId).OnDelete(DeleteBehavior.Cascade);

            // ✅ Banner ilişkisi
            modelBuilder.Entity<Banner>()
                .HasOne(b => b.Company).WithMany()
                .HasForeignKey(b => b.CompanyId).OnDelete(DeleteBehavior.Cascade);
        }
    }
}