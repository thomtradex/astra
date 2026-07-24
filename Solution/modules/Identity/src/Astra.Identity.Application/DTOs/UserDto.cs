namespace Astra.Identity.Application.DTOs;

public sealed record UserDto(
    Guid Id,
    string Email,
    string Name);