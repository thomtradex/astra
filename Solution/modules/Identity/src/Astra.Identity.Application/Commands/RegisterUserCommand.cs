using Astra.SharedKernel.Application.Commands;

namespace Astra.Identity.Application.Commands;

public sealed record RegisterUserCommand(
    string Email,
    string Name,
    string Password)
    : ICommand;