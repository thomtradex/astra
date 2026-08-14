import { Badge } from "@/components/ui/badge/badge";
import { Card } from "@/components/ui/card/card";

type KpiCardProps = {
  title: string;
  value: string;
  trend: string;
};

export function KpiCard({
  title,
  value,
  trend,
}: KpiCardProps) {
  return (
    <Card title={title}>
      <strong>
        {value}
      </strong>

      <Badge>
        {trend}
      </Badge>
    </Card>
  );
}
