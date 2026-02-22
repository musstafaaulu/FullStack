using FluentValidation;
using RestApi.DTOs.Product;

namespace RestApi.Validators;

public class ProductCreateDtoValidator : AbstractValidator<ProductCreateDto>
{
    public ProductCreateDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Ürün adı boş olamaz.");
        RuleFor(x => x.Price).GreaterThan(0).WithMessage("Fiyat 0'dan büyük olmalıdır.");
        RuleFor(x => x.Stock).GreaterThanOrEqualTo(0).WithMessage("Stok negatif olamaz.");
    }
}