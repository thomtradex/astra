using Astra.Organization.Domain.Repositories;

namespace Astra.Organization.Application.Commands.DeleteOrganization;

public sealed class DeleteOrganizationCommandHandler
{
    private readonly IOrganizationRepository _repository;

    public DeleteOrganizationCommandHandler(
        IOrganizationRepository repository)
    {
        _repository = repository;
    }

    public async Task<bool> Handle(
        DeleteOrganizationCommand command,
        CancellationToken cancellationToken)
    {
        var organization = await _repository.GetByIdAsync(
            command.Id,
            cancellationToken);

        if (organization is null)
            return false;

        await _repository.DeleteAsync(
            organization,
            cancellationToken);

        await _repository.SaveChangesAsync(
            cancellationToken);

        return true;
    }
}