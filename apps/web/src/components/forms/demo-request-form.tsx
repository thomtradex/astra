export function DemoRequestForm() {
  return (
    <form>
      <input
        name="company"
        placeholder="Empresa"
      />

      <input
        name="email"
        placeholder="Email profissional"
        type="email"
      />

      <input
        name="projects"
        placeholder="Número de obras"
      />

      <button type="submit">
        Solicitar Demo
      </button>
    </form>
  );
}
