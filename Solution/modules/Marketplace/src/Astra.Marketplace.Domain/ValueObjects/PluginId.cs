namespace Astra.Marketplace.Domain.ValueObjects;

public readonly record struct PluginId(Guid Value)
{
    public static PluginId New() => new(Guid.NewGuid());

    public override string ToString() => Value.ToString();
}