using Astra.Identity.Domain.Entities;

namespace Astra.Identity.Domain.Services;

public interface IJwtService
{
    string GenerateAccessToken(
        User user,
        IReadOnlyCollection<string>? permissions = null);

    string GenerateRefreshToken();
}