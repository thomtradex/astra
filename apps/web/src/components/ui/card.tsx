type CardProps = {
  title?: string;
  children: React.ReactNode;
};

export function Card({
  title,
  children,
}: CardProps) {
  return (
    <section>
      {title && (
        <h3>
          {title}
        </h3>
      )}

      {children}
    </section>
  );
}
