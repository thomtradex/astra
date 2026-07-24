namespace Astra.Identity.Application.Authentication.Login;

public sealed record LoginResponse(
    Guid UserId,
    string AccessToken,
    string RefreshToken);