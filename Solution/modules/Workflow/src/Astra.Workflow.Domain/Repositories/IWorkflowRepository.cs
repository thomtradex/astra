using Astra.Organization.Domain.ValueObjects;
using Astra.Workflow.Domain.Entities;
using Astra.Workflow.Domain.ValueObjects;

namespace Astra.Workflow.Domain.Repositories;

public interface IWorkflowRepository
{
    Task AddAsync(
        WorkflowDefinition workflow,
        CancellationToken cancellationToken = default);

    Task<WorkflowDefinition?> GetByIdAsync(
        WorkflowId id,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<WorkflowDefinition>> GetByOrganizationAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}