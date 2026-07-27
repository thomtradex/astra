namespace Astra.Identity.Application.Authentication.Refresh;

public sealed record RefreshResponse(
    Guid UserId,
    string AccessToken,
    string RefreshToken);