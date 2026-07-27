using FluentValidation;

namespace Astra.Identity.Application.Authentication.Refresh;

public sealed class RefreshCommandValidator
    : AbstractValidator<RefreshCommand>
{
    public RefreshCommandValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty();
    }
}