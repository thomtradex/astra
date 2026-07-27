namespace Astra.Identity.Contracts.Requests;

public sealed record CreateUserRequest(
    string Email,
    string Name,
    string Password);