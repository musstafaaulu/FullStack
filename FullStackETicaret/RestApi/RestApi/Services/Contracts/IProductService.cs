using RestApi.Common;
using RestApi.DTOs.Product;

namespace RestApi.Services.Contracts
{
    public interface IProductService
    {
        Task<ApiResponse<PagedResponse<List<ProductDto>>>> GetAllAsync(ProductQueryDto query);
        Task<ApiResponse<ProductDto>> GetByIdAsync(int id);
        Task<ApiResponse<ProductDto>> CreateAsync(ProductCreateDto dto);
        Task<ApiResponse<ProductDto>> UpdateAsync(int id, ProductUpdateDto dto);
        Task<ApiResponse<bool>> DeleteAsync(int id);
    }
}