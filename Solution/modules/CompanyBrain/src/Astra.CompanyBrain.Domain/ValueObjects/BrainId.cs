using Astra.SharedKernel.Domain.Identifiers;

namespace Astra.CompanyBrain.Domain.ValueObjects;

public sealed record BrainId(Guid Value)
    : StronglyTypedId(Value)
{
    public static BrainId New()
        => new(Guid.NewGuid());
}