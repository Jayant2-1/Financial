function KpiCard({ title, value, tone = 'neutral' }) {
  return (
    <article className={`kpiCard card tone-${tone}`}>
      <p className="kpiTitle">{title}</p>
      <p className="kpiValue">{value}</p>
    </article>
  );
}

export default KpiCard;
