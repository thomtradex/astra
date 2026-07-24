using Astra.Knowledge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Astra.Knowledge.Infrastructure.Persistence;

public sealed class KnowledgeDbContext
    : DbContext
{
    public KnowledgeDbContext(
        DbContextOptions<KnowledgeDbContext> options)
        : base(options)
    {
    }

    public DbSet<KnowledgeBase> KnowledgeBases => Set<KnowledgeBase>();

    public DbSet<Document> Documents => Set<Document>();

    public DbSet<DocumentChunk> DocumentChunks => Set<DocumentChunk>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(KnowledgeDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}