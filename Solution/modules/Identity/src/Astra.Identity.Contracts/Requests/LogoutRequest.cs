namespace Astra.Identity.Contracts.Requests;

public sealed record LogoutRequest(
    string RefreshToken);
