using Astra.Organization.Application.Commands.CreateOrganization;
using Astra.Organization.Application.Queries.GetOrganizationById;

namespace Astra.Organization.Application.Services;

public interface IOrganizationService
{
    Task<Guid> CreateAsync(
        CreateOrganizationCommand command,
        CancellationToken cancellationToken);

    Task<Astra.Organization.Domain.Entities.Organization?> GetByIdAsync(
        GetOrganizationByIdQuery query,
        CancellationToken cancellationToken);
}