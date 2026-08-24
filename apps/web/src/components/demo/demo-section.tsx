type DemoSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function DemoSection({ title, children }: DemoSectionProps) {
  return (
    <section>
      <h2>{title}</h2>

      {children}
    </section>
  );
}
