using MediatR;

namespace Astra.Identity.Application.Authentication.Login;

public sealed record LoginCommand(
    string Email,
    string Password)
    : IRequest<LoginResponse>;