using Astra.Organization.Application.Commands.CreateOrganization;
using Astra.Organization.Application.Queries.GetOrganizationById;

namespace Astra.Organization.Application.Services;

public sealed class OrganizationService
    : IOrganizationService
{
    private readonly CreateOrganizationCommandHandler _createHandler;
    private readonly GetOrganizationByIdQueryHandler _getByIdHandler;

    public OrganizationService(
        CreateOrganizationCommandHandler createHandler,
        GetOrganizationByIdQueryHandler getByIdHandler)
    {
        _createHandler = createHandler;
        _getByIdHandler = getByIdHandler;
    }

    public async Task<Guid> CreateAsync(
        CreateOrganizationCommand command,
        CancellationToken cancellationToken)
    {
        return await _createHandler.Handle(
            command,
            cancellationToken);
    }

    public async Task<Astra.Organization.Domain.Entities.Organization?> GetByIdAsync(
        GetOrganizationByIdQuery query,
        CancellationToken cancellationToken)
    {
        return await _getByIdHandler.Handle(
            query,
            cancellationToken);
    }
}