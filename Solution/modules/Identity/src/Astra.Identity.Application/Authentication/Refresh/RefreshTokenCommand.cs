using Astra.Identity.Application.Authentication.Login;
using MediatR;

namespace Astra.Identity.Application.Authentication.Refresh;

public sealed record RefreshTokenCommand(
    string RefreshToken)
    : IRequest<LoginResponse>;