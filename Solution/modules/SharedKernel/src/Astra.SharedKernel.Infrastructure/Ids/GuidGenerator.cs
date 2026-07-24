using Astra.SharedKernel.Application.Interfaces;

namespace Astra.SharedKernel.Infrastructure.Ids;

public sealed class GuidGenerator : IGuidGenerator
{
    public Guid New()
    {
        return Guid.NewGuid();
    }
}