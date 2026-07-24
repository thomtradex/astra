using Astra.Identity.Domain.Entities;

namespace Astra.Identity.Application.Abstractions;

public interface ITokenProvider
{
    string GenerateAccessToken(
        User user);

    string GenerateRefreshToken();
}