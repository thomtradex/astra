using Astra.Organization.Domain.Repositories;

namespace Astra.Organization.Application.Queries.GetOrganizationById;

public sealed class GetOrganizationByIdQueryHandler
{
    private readonly IOrganizationRepository _repository;

    public GetOrganizationByIdQueryHandler(
        IOrganizationRepository repository)
    {
        _repository = repository;
    }

    public async Task<Astra.Organization.Domain.Entities.Organization?> Handle(
        GetOrganizationByIdQuery query,
        CancellationToken cancellationToken)
    {
        return await _repository.GetByIdAsync(
            query.Id,
            cancellationToken);
    }
}