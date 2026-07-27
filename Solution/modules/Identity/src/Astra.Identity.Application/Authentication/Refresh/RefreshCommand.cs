using MediatR;

namespace Astra.Identity.Application.Authentication.Refresh;

public sealed record RefreshCommand(
    string RefreshToken)
    : IRequest<RefreshResponse>;