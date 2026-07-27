using Astra.Identity.Application.Abstractions;
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
    private readonly IPasswordHasher _passwordHasher;

    public RegisterUserCommandHandler(
        IUserRepository users,
        IPasswordHasher passwordHasher)
    {
        _users = users;
        _passwordHasher = passwordHasher;
    }

    public async Task Handle(
        RegisterUserCommand command,
        CancellationToken cancellationToken = default)
    {
        var email = new Email(command.Email);

        var existing =
            await _users.GetByEmailAsync(
                email.Value,
                cancellationToken);

        if (existing is not null)
            throw new InvalidOperationException(
                "User already exists.");

        var passwordHash =
            _passwordHasher.Hash(
                command.Password);

        var user = new User(
         UserId.New(),
         email,
         command.Name,
         passwordHash);

        await _users.AddAsync(
            user,
            cancellationToken);
    }
}