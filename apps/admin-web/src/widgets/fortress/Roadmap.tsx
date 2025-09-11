// apps/admin-web/src/widgets/fortress/Roadmap.tsx
type Stage = {
  id: string;
  title: string;
  percent: number; // 0..100
  bullets: string[];
  goal: string;
  status?: 'ontrack' | 'risk' | 'blocked';
};

const stages: Stage[] = [
  {
    id: 's1',
    title: 'Stage 1 — Foundation (Baseline Security)',
    percent: 50,
    bullets: [
      'TLS 1.3 everywhere',
      'Basic WAF + rate limits',
      'JWT + API key auth',
      'Logs + monitoring dashboards',
    ],
    goal: 'All current APIs secured with standard best practices.',
    status: 'ontrack',
  },
  {
    id: 's2',
    title: 'Stage 2 — AI-Shield Layer',
    percent: 30,
    bullets: [
      'AI-adaptive WAF (detects AI attack patterns)',
      'ML-based DDoS protection',
      'Decoy APIs (honeypots)',
      'API key rotation automation',
    ],
    goal: 'Resistant to automated AI scans & brute-force patterns.',
    status: 'ontrack',
  },
  {
    id: 's3',
    title: 'Stage 3 — Enterprise Fortress',
    percent: 10,
    bullets: [
      'Zero-Trust between microservices',
      'Real-time anomaly detection (AI vs AI)',
      'Automated quarantine & circuit breakers',
      'Immutable compliance audit logs',
    ],
    goal: 'Enterprise-grade fortress with full auth/monitoring/logging.',
    status: 'risk',
  },
  {
    id: 's4',
    title: 'Stage 4 — Government & Defense',
    percent: 0,
    bullets: [
      'Multi-region sovereign deploys',
      'SLA with 24/7 war-room ops',
      'Master key escrow & multi-sig admin actions',
      'Dedicated AI Cyber Shield agents',
    ],
    goal: 'Critical-infra resilience (FedRAMP / ITAR / CJIS ready).',
    status: 'blocked',
  },
];

function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="progress">
      <div className="progress-fill" style={{ width: `${clamped}%` }} />
      <span className="progress-label">{clamped}%</span>
    </div>
  );
}

function StatusPill({ status }: { status?: Stage['status'] }) {
  const map = {
    ontrack: { label: 'On Track', className: 'pill pill-ok' },
    risk: { label: 'Risk', className: 'pill pill-warn' },
    blocked: { label: 'Blocked', className: 'pill pill-danger' },
  } as const;
  if (!status) return null;
  const s = map[status];
  return <span className={s.className}>{s.label}</span>;
}

export default function Roadmap() {
  return (
    <div className="roadmap">
      {stages.map((st) => (
        <div key={st.id} className="stage">
          <div className="stage-head">
            <h3>{st.title}</h3>
            <StatusPill status={st.status} />
          </div>
          <ProgressBar value={st.percent} />
          <ul className="stage-bullets">
            {st.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <p className="stage-goal"><strong>Goal:</strong> {st.goal}</p>
        </div>
      ))}
    </div>
  );
}
