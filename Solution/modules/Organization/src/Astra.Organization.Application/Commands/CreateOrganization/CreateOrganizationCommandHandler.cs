using Astra.Organization.Domain.Repositories;

namespace Astra.Organization.Application.Commands.CreateOrganization;

public sealed class CreateOrganizationCommandHandler
{
    private readonly IOrganizationRepository _repository;

    public CreateOrganizationCommandHandler(
        IOrganizationRepository repository)
    {
        _repository = repository;
    }

    public async Task<Guid> Handle(
        CreateOrganizationCommand command,
        CancellationToken cancellationToken)
    {
        var organization = new Astra.Organization.Domain.Entities.Organization(
            command.Name,
            command.Slug);

        await _repository.AddAsync(
            organization,
            cancellationToken);

        await _repository.SaveChangesAsync(
            cancellationToken);

        return organization.Id;
    }
}