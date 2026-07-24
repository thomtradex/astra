using Astra.SharedKernel.Domain.Entities;

namespace Astra.Identity.Domain.Entities;

public sealed class RefreshToken : AggregateRoot<Guid>
{
    private RefreshToken()
    {
    }

    public RefreshToken(
        Guid id,
        Guid userId,
        string token,
        DateTime expiresAtUtc)
    {
        Id = id;

        UserId = userId;

        Token = token;

        ExpiresAtUtc = expiresAtUtc;
    }

    public Guid UserId { get; private set; }

    public string Token { get; private set; } = string.Empty;

    public DateTime ExpiresAtUtc { get; private set; }

    public DateTime? RevokedAtUtc { get; private set; }

    public bool IsExpired
        => DateTime.UtcNow >= ExpiresAtUtc;

    public bool IsRevoked
        => RevokedAtUtc.HasValue;

    public void Revoke()
    {
        if (!IsRevoked)
        {
            RevokedAtUtc = DateTime.UtcNow;
        }
    }
}