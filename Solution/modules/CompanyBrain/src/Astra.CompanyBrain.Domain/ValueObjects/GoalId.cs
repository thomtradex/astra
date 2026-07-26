using Astra.SharedKernel.Domain.Identifiers;

namespace Astra.CompanyBrain.Domain.ValueObjects;

public sealed record GoalId(Guid Value)
    : StronglyTypedId(Value)
{
    public static GoalId New()
        => new(Guid.NewGuid());
}