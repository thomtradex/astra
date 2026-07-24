using Astra.Organization.Domain.Repositories;

namespace Astra.Organization.Application.Commands.UpdateOrganization;

public sealed class UpdateOrganizationCommandHandler
{
    private readonly IOrganizationRepository _repository;

    public UpdateOrganizationCommandHandler(
        IOrganizationRepository repository)
    {
        _repository = repository;
    }

    public async Task<bool> Handle(
        UpdateOrganizationCommand command,
        CancellationToken cancellationToken)
    {
        var organization = await _repository.GetByIdAsync(
            command.Id,
            cancellationToken);

        if (organization is null)
            return false;

        organization.Update(
            command.Name,
            command.Slug);

        await _repository.SaveChangesAsync(
            cancellationToken);

        return true;
    }
}