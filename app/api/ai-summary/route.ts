import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const billId = searchParams.get("billId");
  const billIdentifier = searchParams.get("billIdentifier");
  const billTitle = searchParams.get("billTitle");

  // For now, return a placeholder summary with bill-specific details
  console.log(`Generating AI summary for bill ${billIdentifier}: ${billTitle}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate a more specific summary based on the bill details
  let summary = "";
  
  if (billTitle?.toLowerCase().includes("tax") || billIdentifier?.toLowerCase().includes("tax")) {
    summary = `${billIdentifier} addresses tax policy changes. This bill proposes modifications to existing tax structures that could affect both individuals and businesses. Key provisions include potential changes to tax rates, deductions, or credits. The fiscal impact would vary depending on implementation timeline and economic conditions.`;
  } else if (billTitle?.toLowerCase().includes("education") || billIdentifier?.toLowerCase().includes("edu")) {
    summary = `${billIdentifier} focuses on education reform. This legislation aims to improve educational outcomes through funding changes, curriculum standards, or administrative restructuring. If enacted, it would impact students, educators, and educational institutions across the jurisdiction.`;
  } else if (billTitle?.toLowerCase().includes("health") || billIdentifier?.toLowerCase().includes("health")) {
    summary = `${billIdentifier} proposes healthcare system changes. This bill addresses healthcare access, coverage, or delivery methods. Key provisions may include insurance reforms, provider regulations, or patient protections. Implementation would likely involve coordination between multiple healthcare stakeholders.`;
  } else {
    summary = `${billIdentifier}: "${billTitle}" proposes changes to existing regulations or introduces new policy frameworks. The bill addresses specific challenges in its target domain and would establish new standards or procedures if enacted. Stakeholders directly affected would include regulatory bodies and those operating within the sector targeted by this legislation.`;
  }

  return NextResponse.json({
    summary,
    billId,
    billIdentifier,
    billTitle
  });
} 