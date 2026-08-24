const projects = [
  {
    name: 'Torre Residencial Norte',
    status: 'Em execução',
    progress: '78%',
  },
  {
    name: 'Projeto Lisboa',
    status: 'Planeamento',
    progress: '45%',
  },
  {
    name: 'Complexo Industrial Sul',
    status: 'Concluído',
    progress: '100%',
  },
];

export function ProjectTable() {
  return (
    <section>
      <h2>Projetos ativos</h2>

      <ul>
        {projects.map((project) => (
          <li key={project.name}>
            {project.name} — {project.status} — {project.progress}
          </li>
        ))}
      </ul>
    </section>
  );
}
