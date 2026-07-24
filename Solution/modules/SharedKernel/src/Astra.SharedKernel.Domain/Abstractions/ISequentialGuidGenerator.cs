namespace Astra.SharedKernel.Domain.Abstractions;

public interface ISequentialGuidGenerator
{
    Guid New();
}