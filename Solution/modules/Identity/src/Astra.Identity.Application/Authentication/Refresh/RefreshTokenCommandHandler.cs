using Astra.Identity.Application.Abstractions;
using Astra.Identity.Application.Authentication.Login;
using Astra.Identity.Domain.Entities;
using Astra.Identity.Domain.Repositories;
using Astra.Identity.Domain.ValueObjects;
using MediatR;

namespace Astra.Identity.Application.Authentication.Refresh;

public sealed class RefreshTokenCommandHandler
    : IRequestHandler<RefreshTokenCommand, LoginResponse>
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITokenProvider _tokenProvider;

    public RefreshTokenCommandHandler(
        IRefreshTokenRepository refreshTokenRepository,
        IUserRepository userRepository,
        ITokenProvider tokenProvider)
    {
        _refreshTokenRepository = refreshTokenRepository;
        _userRepository = userRepository;
        _tokenProvider = tokenProvider;
    }

    public async Task<LoginResponse> Handle(
        RefreshTokenCommand request,
        CancellationToken cancellationToken)
    {
        var refreshToken =
            await _refreshTokenRepository.GetByTokenAsync(
                request.RefreshToken,
                cancellationToken);

        if (refreshToken is null)
            throw new UnauthorizedAccessException(
                "Invalid refresh token.");

        if (refreshToken.IsRevoked)
            throw new UnauthorizedAccessException(
                "Refresh token revoked.");

        if (refreshToken.IsExpired)
            throw new UnauthorizedAccessException(
                "Refresh token expired.");

        var user =
            await _userRepository.GetByIdAsync(
                refreshToken.UserId,
                cancellationToken);

        if (user is null)
            throw new UnauthorizedAccessException(
                "User not found.");

        refreshToken.Revoke();

        await _refreshTokenRepository.UpdateAsync(
            refreshToken,
            cancellationToken);

        var newAccessToken =
            _tokenProvider.GenerateAccessToken(user);

        var newRefreshTokenValue =
            _tokenProvider.GenerateRefreshToken();

        var newRefreshToken =
            new RefreshToken(
                RefreshTokenId.New(),
                user.Id,
                newRefreshTokenValue,
                DateTime.UtcNow.AddDays(7));

        await _refreshTokenRepository.AddAsync(
            newRefreshToken,
            cancellationToken);

        return new LoginResponse(
            user.Id.Value,
            newAccessToken,
            newRefreshTokenValue);
    }
}