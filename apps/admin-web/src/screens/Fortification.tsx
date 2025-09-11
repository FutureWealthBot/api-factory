// apps/admin-web/src/screens/Fortification.tsx
import Roadmap from '../widgets/fortress/Roadmap';
import Tiers from '../widgets/fortress/Tiers';
import SecurityScan from '../widgets/fortress/SecurityScan';

export default function Fortification() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>AI Cyber Fortress</h1>
        <p>Defense-in-depth for API-Factory • Real-time AI threat resilience</p>
      </header>

      <section className="card">
        <h2>Roadmap Progress</h2>
        <Roadmap />
      </section>

      <section className="card">
        <h2>Pricing & Security Tiers</h2>
        <Tiers />
      </section>

      <section className="card">
        <h2>Latest Security Scan</h2>
        <SecurityScan />
      </section>
    </div>
  );
}
