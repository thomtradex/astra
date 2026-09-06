type ReportCenterProps = {
  reports: string[];
};

export function ReportCenter({ reports }: ReportCenterProps) {
  return (
    <section>
      <h2>Relatórios operacionais</h2>

      <p>
        Informação operacional organizada para apoiar acompanhamento,
        análise e tomada de decisão.
      </p>

      <ul>
        {reports.map((report) => (
          <li key={report}>{report}</li>
        ))}
      </ul>
    </section>
  );
}
