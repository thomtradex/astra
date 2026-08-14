type CardProps = {
  title?: string;
  children: React.ReactNode;
};

export function Card({
  title,
  children,
}: CardProps) {
  return (
    <article>
      {title && (
        <h3>
          {title}
        </h3>
      )}

      {children}
    </article>
  );
}
