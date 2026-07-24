using Astra.Organization.Application.Commands.CreateOrganization;
using Astra.Organization.Application.Commands.DeleteOrganization;
using Astra.Organization.Application.Commands.UpdateOrganization;
using Astra.Organization.Application.Queries.GetOrganizationById;
using Astra.Organization.Domain.ValueObjects;
using Microsoft.AspNetCore.Mvc;

namespace Astra.Organization.Api.Controllers;

[ApiController]
[Route("organization")]
public sealed class OrganizationController : ControllerBase
{
    private readonly CreateOrganizationCommandHandler _createHandler;
    private readonly UpdateOrganizationCommandHandler _updateHandler;
    private readonly DeleteOrganizationCommandHandler _deleteHandler;
    private readonly GetOrganizationByIdQueryHandler _getHandler;

    public OrganizationController(
        CreateOrganizationCommandHandler createHandler,
        UpdateOrganizationCommandHandler updateHandler,
        DeleteOrganizationCommandHandler deleteHandler,
        GetOrganizationByIdQueryHandler getHandler)
    {
        _createHandler = createHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
        _getHandler = getHandler;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateOrganizationRequest request,
        CancellationToken cancellationToken)
    {
        var id = await _createHandler.Handle(
            new CreateOrganizationCommand(
                request.Name,
                request.Slug),
            cancellationToken);

        return Created(
            $"/organization/{id}",
            new { Id = id });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(
        Guid id,
        CancellationToken cancellationToken)
    {
        var organization = await _getHandler.Handle(
            new GetOrganizationByIdQuery(
                new OrganizationId(id)),
            cancellationToken);

        if (organization is null)
            return NotFound();

        return Ok(organization);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateOrganizationRequest request,
        CancellationToken cancellationToken)
    {
        var updated = await _updateHandler.Handle(
            new UpdateOrganizationCommand(
                new OrganizationId(id),
                request.Name,
                request.Slug),
            cancellationToken);

        if (!updated)
            return NotFound();

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        var deleted = await _deleteHandler.Handle(
            new DeleteOrganizationCommand(
                new OrganizationId(id)),
            cancellationToken);

        if (!deleted)
            return NotFound();

        return NoContent();
    }
}

public sealed record CreateOrganizationRequest(
    string Name,
    string Slug);

public sealed record UpdateOrganizationRequest(
    string Name,
    string Slug);