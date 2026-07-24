using Astra.Organization.Domain.ValueObjects;
using Astra.Workflow.Domain.Entities;
using Astra.Workflow.Domain.Repositories;
using Astra.Workflow.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.Workflow.Infrastructure.Persistence.Repositories;

public sealed class WorkflowRepository : IWorkflowRepository
{
    private readonly WorkflowDbContext _context;

    public WorkflowRepository(
        WorkflowDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(
        WorkflowDefinition workflow,
        CancellationToken cancellationToken = default)
    {
        await _context.Workflows.AddAsync(workflow, cancellationToken);
    }

    public async Task<WorkflowDefinition?> GetByIdAsync(
        WorkflowId id,
        CancellationToken cancellationToken = default)
    {
        return await _context.Workflows.FirstOrDefaultAsync(
            x => x.Id == id,
            cancellationToken);
    }

    public async Task<IEnumerable<WorkflowDefinition>> GetByOrganizationAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Workflows
            .Where(x => x.OrganizationId == organizationId)
            .ToListAsync(cancellationToken);
    }

    public Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }
}