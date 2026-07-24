namespace Astra.SharedKernel.Domain.Serialization;

public interface ISerializerOptions
{
    bool WriteIndented { get; }

    bool IgnoreNullValues { get; }

    bool CaseInsensitive { get; }
}