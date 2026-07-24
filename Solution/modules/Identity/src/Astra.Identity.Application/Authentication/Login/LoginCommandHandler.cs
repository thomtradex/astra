using Astra.Identity.Application.Abstractions;
using Astra.Identity.Domain.Repositories;
using MediatR;

namespace Astra.Identity.Application.Authentication.Login;

public sealed class LoginCommandHandler
    : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenProvider _tokenProvider;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenProvider tokenProvider)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenProvider = tokenProvider;
    }

    public async Task<LoginResponse> Handle(
        LoginCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(
            request.Email,
            cancellationToken);

        if (user is null)
            throw new UnauthorizedAccessException("Invalid credentials.");

        var validPassword = _passwordHasher.Verify(
            request.Password,
            user.PasswordHash);

        if (!validPassword)
            throw new UnauthorizedAccessException("Invalid credentials.");

        var accessToken =
            _tokenProvider.GenerateAccessToken(user);

        var refreshToken =
            _tokenProvider.GenerateRefreshToken();

        return new LoginResponse(
            user.Id,
            accessToken,
            refreshToken);
    }
}