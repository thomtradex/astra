export function ProjectOverview() {
  const projects = [
    {
      name: 'Lisboa Tower Construction',
      progress: '78%',
      budget: '€4.2M',
      status: 'On Track',
    },
    {
      name: 'Porto Infrastructure',
      progress: '54%',
      budget: '€2.8M',
      status: 'Monitoring',
    },
  ];

  return (
    <section>
      <h2>Project Overview</h2>

      <ul>
        {projects.map((project) => (
          <li key={project.name}>
            <strong>{project.name}</strong>
            <p>Progress: {project.progress}</p>
            <p>Budget: {project.budget}</p>
            <p>Status: {project.status}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
