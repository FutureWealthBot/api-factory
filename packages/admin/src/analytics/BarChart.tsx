// Simple charting utility for AnalyticsDashboard (wrapper for Chart.js or similar)
// React import not required for JSX with React 17+ transform.

export type ChartProps = {
  labels: string[];
  data: number[];
  title?: string;
};

export default function BarChart({ labels, data, title }: ChartProps) {
  // Placeholder: render a simple bar chart using divs (replace with Chart.js for production)
  const max = Math.max(...data, 1);
  return (
    <div style={{ width: '100%', padding: 8 }}>
      {title && <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{title}</div>}
      <div style={{ display: 'flex', alignItems: 'flex-end', height: 120, gap: 4 }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: '#4e79a7', width: '80%', height: `${(v / max) * 100}%`, minHeight: 2 }} />
            <div style={{ fontSize: 10, marginTop: 2 }}>{labels[i]}</div>
            <div style={{ fontSize: 10 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
