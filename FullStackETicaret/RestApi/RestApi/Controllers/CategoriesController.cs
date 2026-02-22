using Microsoft.AspNetCore.Mvc;
using RestApi.Data;
using RestApi.Models;
using RestApi.Common;
using RestApi.DTOs.Category; // DTO'yu kullanmak için şart

namespace RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _db;

    public CategoriesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CategoryCreateDto dto)
    {
        var category = new Category { Name = dto.Name };
        await _db.Categories.AddAsync(category);
        await _db.SaveChangesAsync();
        
        return Ok(ApiResponse<Category>.SuccessResponse(category, "Kategori başarıyla eklendi"));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = _db.Categories.ToList();
        return Ok(ApiResponse<List<Category>>.SuccessResponse(categories));
    }
}