using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics; // Susturucu için gereken kütüphane
using Nexus.Core.Entities;

namespace Nexus.Data.Contexts
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<User> Users { get; set; }

        // İŞTE SİSTEMİ RAHATLATAN SUSTURUCU KOD BURASI
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.ConfigureWarnings(warnings => 
                warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
            
            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<User>().HasData(
                new User 
                { 
                    Id = 1, 
                    FullName = "Mustafa Ulu", 
                    Email = "mustafa@admin.com", 
                    PasswordHash = "123", 
                    Role = "Super Admin",
                    RegisteredAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    CompanyId = 1
                }
            );
        }
    }
}