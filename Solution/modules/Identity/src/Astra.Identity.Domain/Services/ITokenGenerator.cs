namespace Astra.Identity.Domain.Services;

public interface ITokenGenerator
{
    string GenerateAccessToken(Guid userId);

    string GenerateRefreshToken();
}