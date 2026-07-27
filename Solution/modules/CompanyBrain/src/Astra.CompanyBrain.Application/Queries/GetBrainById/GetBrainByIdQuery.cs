using Astra.CompanyBrain.Domain.ValueObjects;

namespace Astra.CompanyBrain.Application.Queries.GetBrainById;

public sealed record GetBrainByIdQuery(
    BrainId BrainId);
