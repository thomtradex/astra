namespace Astra.Identity.Contracts.Responses;

public sealed record LoginResponse(
    Guid UserId,
    string AccessToken,
    string RefreshToken);