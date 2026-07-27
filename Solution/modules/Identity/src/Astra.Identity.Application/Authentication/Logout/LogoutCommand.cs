using MediatR;

namespace Astra.Identity.Application.Authentication.Logout;

public sealed record LogoutCommand(
    string RefreshToken)
    : IRequest;
