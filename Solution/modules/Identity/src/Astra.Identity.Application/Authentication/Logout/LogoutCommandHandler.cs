using Astra.Identity.Domain.Repositories;
using MediatR;

namespace Astra.Identity.Application.Authentication.Logout;

public sealed class LogoutCommandHandler
    : IRequestHandler<LogoutCommand>
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;

    public LogoutCommandHandler(
        IRefreshTokenRepository refreshTokenRepository)
    {
        _refreshTokenRepository = refreshTokenRepository;
    }

    public async Task Handle(
        LogoutCommand request,
        CancellationToken cancellationToken)
    {
        var refreshToken =
            await _refreshTokenRepository.GetByTokenAsync(
                request.RefreshToken,
                cancellationToken);

        if (refreshToken is null)
            throw new UnauthorizedAccessException(
                "Invalid refresh token.");

        if (refreshToken.RevokedAtUtc is not null)
            return;

        refreshToken.Revoke();

        await _refreshTokenRepository.UpdateAsync(
            refreshToken,
            cancellationToken);
    }
}
