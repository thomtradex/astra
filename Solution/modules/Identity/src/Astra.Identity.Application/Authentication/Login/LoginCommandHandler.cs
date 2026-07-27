using Astra.Identity.Application.Abstractions;
using Astra.Identity.Domain.Entities;
using Astra.Identity.Domain.Repositories;
using Astra.Identity.Domain.ValueObjects;
using MediatR;

namespace Astra.Identity.Application.Authentication.Login;

public sealed class LoginCommandHandler
    : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenProvider _tokenProvider;
    private readonly IRefreshTokenRepository _refreshTokenRepository;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenProvider tokenProvider,
        IRefreshTokenRepository refreshTokenRepository)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenProvider = tokenProvider;
        _refreshTokenRepository = refreshTokenRepository;
    }

    public async Task<LoginResponse> Handle(
        LoginCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(
            request.Email,
            cancellationToken);

        if (user is null)
            throw new UnauthorizedAccessException(
                "Invalid credentials.");

        var validPassword =
            _passwordHasher.Verify(
                request.Password,
                user.PasswordHash);

        if (!validPassword)
            throw new UnauthorizedAccessException(
                "Invalid credentials.");

        var accessToken =
            _tokenProvider.GenerateAccessToken(user);

        var refreshTokenValue =
            _tokenProvider.GenerateRefreshToken();

        var refreshToken =
            new RefreshToken(
                RefreshTokenId.New(),
                user.Id,
                refreshTokenValue,
                DateTime.UtcNow.AddDays(7));

        await _refreshTokenRepository.AddAsync(
            refreshToken,
            cancellationToken);

        return new LoginResponse(
            user.Id.Value,
            accessToken,
            refreshTokenValue);
    }
}