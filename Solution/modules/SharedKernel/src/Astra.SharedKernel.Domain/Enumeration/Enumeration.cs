namespace Astra.SharedKernel.Domain.Enumeration;

public abstract class Enumeration
    : IComparable
{
    public int Id { get; }

    public string Name { get; }

    protected Enumeration(
        int id,
        string name)
    {
        Id = id;
        Name = name;
    }

    public override string ToString()
        => Name;

    public override bool Equals(object? obj)
    {
        if (obj is not Enumeration other)
            return false;

        return GetType() == other.GetType()
            && Id == other.Id;
    }

    public override int GetHashCode()
        => HashCode.Combine(
            GetType(),
            Id);

    public int CompareTo(object? other)
        => Id.CompareTo(((Enumeration)other!).Id);

    public static IEnumerable<T> GetAll<T>()
        where T : Enumeration
    {
        return typeof(T)
            .GetFields(
                System.Reflection.BindingFlags.Public |
                System.Reflection.BindingFlags.Static |
                System.Reflection.BindingFlags.DeclaredOnly)
            .Select(f => f.GetValue(null))
            .Cast<T>();
    }
}