using Astra.Identity.Application.Commands;
using Astra.Identity.Domain.Entities;
using Astra.Identity.Domain.Repositories;
using Astra.Identity.Domain.ValueObjects;
using Astra.SharedKernel.Application.Commands;

namespace Astra.Identity.Application.Handlers;

public sealed class RegisterUserCommandHandler
    : ICommandHandler<RegisterUserCommand>
{
    private readonly IUserRepository _users;

    public RegisterUserCommandHandler(
        IUserRepository users)
    {
        _users = users;
    }

    public async Task Handle(
        RegisterUserCommand command,
        CancellationToken cancellationToken = default)
    {
        var existing =
            await _users.GetByEmailAsync(
                command.Email,
                cancellationToken);

        if (existing is not null)
            throw new InvalidOperationException(
                "User already exists.");

        var user =
            new User(
                Guid.NewGuid(),
                command.Email,
                command.Name,
                new PasswordHash(command.Password));

        await _users.AddAsync(
            user,
            cancellationToken);
    }
}