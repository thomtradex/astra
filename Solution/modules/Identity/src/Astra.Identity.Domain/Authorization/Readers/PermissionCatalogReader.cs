using System.Reflection;

namespace Astra.Identity.Domain.Authorization;

public static class PermissionCatalogReader
{
    public static IReadOnlyCollection<string> GetAll()
    {
        var permissions = new List<string>();

        var nestedTypes = typeof(PermissionCatalog).GetNestedTypes(
            BindingFlags.Public);

        foreach (var nestedType in nestedTypes)
        {
            var fields = nestedType.GetFields(
                BindingFlags.Public |
                BindingFlags.Static |
                BindingFlags.FlattenHierarchy);

            foreach (var field in fields)
            {
                if (field.FieldType != typeof(string))
                    continue;

                if (field.GetValue(null) is string permission)
                    permissions.Add(permission);
            }
        }

        return permissions;
    }
}