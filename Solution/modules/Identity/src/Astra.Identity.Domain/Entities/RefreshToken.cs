using Astra.Identity.Domain.ValueObjects;
using Astra.SharedKernel.Domain.Entities;

namespace Astra.Identity.Domain.Entities;

public sealed class RefreshToken : AggregateRoot<RefreshTokenId>
{
    private RefreshToken()
    {
    }

    public RefreshToken(
        RefreshTokenId id,
        UserId userId,
        string token,
        DateTime expiresAtUtc)
        : base(id)
    {
        UserId = userId;
        Token = token;
        ExpiresAtUtc = expiresAtUtc;
    }

    public UserId UserId { get; private set; }

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
            RevokedAtUtc = DateTime.UtcNow;
    }
}