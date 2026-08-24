type ProjectStatusProps = {
  projects: Array<{
    name: string;
    status: string;
  }>;
};

export function ProjectStatus({ projects }: ProjectStatusProps) {
  return (
    <section>
      <h2>Project Intelligence</h2>

      <ul>
        {projects.map((project) => (
          <li key={project.name}>
            {project.name} - {project.status}
          </li>
        ))}
      </ul>
    </section>
  );
}
