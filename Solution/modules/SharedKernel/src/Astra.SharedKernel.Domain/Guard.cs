namespace Astra.SharedKernel.Domain;

public static class Guard
{
    public static void AgainstNull(object? value, string name)
    {
        if (value is null)
            throw new ArgumentNullException(name);
    }

    public static void AgainstNullOrWhiteSpace(string? value, string name)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException($"{name} cannot be empty.", name);
    }

    public static void Against(Guid value, string name)
    {
        if (value == Guid.Empty)
            throw new ArgumentException($"{name} cannot be empty.", name);
    }

    public static void Against(bool condition, string message)
    {
        if (condition)
            throw new InvalidOperationException(message);
    }
}