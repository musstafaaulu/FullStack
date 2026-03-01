using AutoMapper;
using Nexus.API.DTOs;
using Nexus.Core.Entities;

namespace Nexus.API.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Product
            CreateMap<ProductCreateDto, Product>();
            CreateMap<ProductUpdateDto, Product>();
            CreateMap<Product, ProductResponseDto>()
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.Brand != null ? src.Brand.Name : null));

            // Category
            CreateMap<CategoryCreateDto, Category>();
            CreateMap<Category, CategoryResponseDto>();

            // Brand
            CreateMap<BrandCreateDto, Brand>();
            CreateMap<Brand, BrandResponseDto>();

            // Order
            CreateMap<OrderCreateDto, Order>();
            CreateMap<Order, OrderResponseDto>();

            // Comment
            CreateMap<CommentCreateDto, Comment>();
            CreateMap<Comment, CommentResponseDto>();
        }
    }
}