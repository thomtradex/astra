const projects = [
  {
    name: "Lisboa Tower",
    status: "On schedule",
  },
  {
    name: "Porto Infrastructure",
    status: "Monitoring",
  },
];

export function ProjectStatus() {
  return (
    <section>
      <h2>
        Project Intelligence
      </h2>

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
