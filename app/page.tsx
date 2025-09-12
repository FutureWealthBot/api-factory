import Link from 'next/link';

export default function Home() {
  return (
    <main style={{padding:32}}>
      <h1>API Factory Next.js App</h1>
      <ul style={{marginTop: 24, fontSize: 18}}>
        <li><Link href="/retirement-planner">Retirement Planner</Link></li>
        <li><Link href="/pricing">Pricing</Link></li>
      </ul>
    </main>
  );
}
