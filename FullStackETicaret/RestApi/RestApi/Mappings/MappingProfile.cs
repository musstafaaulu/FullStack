using AutoMapper;
using RestApi.Models;
using RestApi.DTOs.Product;

namespace RestApi.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Veritabanı Modeli <-> DTO eşleşmeleri
            CreateMap<Product, ProductDto>().ReverseMap();
            CreateMap<ProductCreateDto, Product>();
            CreateMap<ProductUpdateDto, Product>();
        }
    }
}