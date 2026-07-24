namespace Astra.Identity.Domain.Authorization;

public static class PermissionCatalog
{
    public static class Users
    {
        public const string Create = "users.create";
        public const string Read = "users.read";
        public const string Update = "users.update";
        public const string Delete = "users.delete";
    }

    public static class Roles
    {
        public const string Assign = "roles.assign";
    }

    public static class Organization
    {
        public const string Read = "organization.read";
        public const string Update = "organization.update";
        public const string Delete = "organization.delete";
    }

    public static class Knowledge
    {
        public const string Create = "knowledge.create";
        public const string Read = "knowledge.read";
        public const string Update = "knowledge.update";
        public const string Delete = "knowledge.delete";
    }

    public static class Agents
    {
        public const string Create = "agents.create";
        public const string Execute = "agents.execute";
        public const string Delete = "agents.delete";
    }

    public static class Workflow
    {
        public const string Create = "workflow.create";
        public const string Execute = "workflow.execute";
        public const string Publish = "workflow.publish";
    }

    public static class Memory
    {
        public const string Read = "memory.read";
        public const string Write = "memory.write";
        public const string Delete = "memory.delete";
    }

    public static class Plugins
    {
        public const string Install = "plugins.install";
        public const string Remove = "plugins.remove";
    }

    public static class Billing
    {
        public const string Manage = "billing.manage";
    }

    public static class Settings
    {
        public const string Update = "settings.update";
    }
}