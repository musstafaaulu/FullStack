using AutoMapper;
using Microsoft.EntityFrameworkCore;
using RestApi.Common;
using RestApi.Data;
using RestApi.DTOs.Product;
using RestApi.Models;
using RestApi.Services.Contracts;

namespace RestApi.Services
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _db;
        private readonly IMapper _mapper;

        public ProductService(AppDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<ApiResponse<PagedResponse<List<ProductDto>>>> GetAllAsync(ProductQueryDto query)
        {
            // .Include(p => p.Category) ekleyerek ürünle birlikte kategori bilgisini de getiriyoruz.
            var queryable = _db.Products
                .Include(p => p.Category)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
                queryable = queryable.Where(p => p.Name.Contains(query.Search));

            var totalCount = await queryable.CountAsync();
            
            var products = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<ProductDto>>(products);
            var pagedData = new PagedResponse<List<ProductDto>>(dtos, totalCount, query.PageNumber, query.PageSize);

            return ApiResponse<PagedResponse<List<ProductDto>>>.SuccessResponse(pagedData);
        }

        public async Task<ApiResponse<ProductDto>> GetByIdAsync(int id)
        {
            var product = await _db.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (product == null) return ApiResponse<ProductDto>.FailureResponse("Ürün bulunamadı", 404);
            
            return ApiResponse<ProductDto>.SuccessResponse(_mapper.Map<ProductDto>(product));
        }

        public async Task<ApiResponse<ProductDto>> CreateAsync(ProductCreateDto dto)
        {
            try 
            {
                var product = _mapper.Map<Product>(dto);
                
                // HATA BURADAYDI: Product modelinde CreatedDate property'si yok.
                // Kodu derleyebilmen için bu satırı yoruma aldım. 
                // product.CreatedDate = DateTime.Now; 
                
                await _db.Products.AddAsync(product);
                await _db.SaveChangesAsync();

                var resultDto = _mapper.Map<ProductDto>(product);
                return ApiResponse<ProductDto>.SuccessResponse(resultDto, "Ürün başarıyla oluşturuldu");
            }
            catch (Exception ex)
            {
                var errorDetail = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return ApiResponse<ProductDto>.FailureResponse($"Veritabanı Hatası: {errorDetail}", 500);
            }
        }

        public async Task<ApiResponse<ProductDto>> UpdateAsync(int id, ProductUpdateDto dto)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null) return ApiResponse<ProductDto>.FailureResponse("Ürün bulunamadı", 404);
            
            _mapper.Map(dto, product);
            await _db.SaveChangesAsync();
            
            return ApiResponse<ProductDto>.SuccessResponse(_mapper.Map<ProductDto>(product));
        }

        public async Task<ApiResponse<bool>> DeleteAsync(int id)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null) return ApiResponse<bool>.FailureResponse("Ürün bulunamadı", 404);
            
            _db.Products.Remove(product);
            await _db.SaveChangesAsync();
            
            return ApiResponse<bool>.SuccessResponse(true, "Ürün silindi");
        }
    }
}