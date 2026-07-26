using Astra.SharedKernel.Domain.Identifiers;

namespace Astra.CompanyBrain.Domain.ValueObjects;

public sealed record ReasoningSessionId(Guid Value)
    : StronglyTypedId(Value)
{
    public static ReasoningSessionId New()
        => new(Guid.NewGuid());
}