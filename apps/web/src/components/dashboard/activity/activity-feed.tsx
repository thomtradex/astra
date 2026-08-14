const activities = [
  "Documento técnico aprovado",
  "Projeto Lisboa atualizado",
  "Manutenção preventiva concluída",
];

export function ActivityFeed() {
  return (
    <section>
      <h2>
        Atividade recente
      </h2>

      <ul>
        {activities.map((activity) => (
          <li key={activity}>
            {activity}
          </li>
        ))}
      </ul>
    </section>
  );
}
