import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENABLE_RETIREMENT_PLANNER !== 'true') {
    return NextResponse.json({ error: 'Feature disabled' }, { status: 403 });
  }
  const { pension = 0, ira = 0, socialSecurity = 0, years = 20 } = await req.json();

  // Simple illustrative calculation (replace with real formulas as needed)
  const total = Number(pension) + Number(ira) + Number(socialSecurity);
  const annual = total / years;

  return NextResponse.json({
    total,
    annual,
    years,
    breakdown: { pension, ira, socialSecurity }
  });
}
