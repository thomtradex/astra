using Astra.SharedKernel.Domain.Identifiers;

namespace Astra.CompanyBrain.Domain.ValueObjects;

public sealed record CapabilityId(Guid Value)
    : StronglyTypedId(Value)
{
    public static CapabilityId New()
        => new(Guid.NewGuid());
}