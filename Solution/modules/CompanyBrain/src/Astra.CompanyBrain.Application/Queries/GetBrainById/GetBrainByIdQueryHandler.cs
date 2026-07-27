using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.Repositories;

namespace Astra.CompanyBrain.Application.Queries.GetBrainById;

public sealed class GetBrainByIdQueryHandler
{
    private readonly IBrainRepository _repository;

    public GetBrainByIdQueryHandler(
        IBrainRepository repository)
    {
        _repository = repository;
    }

    public async Task<Brain?> Handle(
        GetBrainByIdQuery query,
        CancellationToken cancellationToken)
    {
        return await _repository.GetByIdAsync(
            query.BrainId,
            cancellationToken);
    }
}
