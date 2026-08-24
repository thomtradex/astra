export function AssetOverview() {
  const assets = [
    {
      name: 'Tower Crane A1',
      status: 'Operational',
      availability: '99%',
    },
    {
      name: 'Excavator X200',
      status: 'Maintenance Required',
      availability: '87%',
    },
  ];

  return (
    <section>
      <h2>Asset Intelligence</h2>

      <ul>
        {assets.map((asset) => (
          <li key={asset.name}>
            <strong>{asset.name}</strong>
            <p>Status: {asset.status}</p>
            <p>Availability: {asset.availability}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
