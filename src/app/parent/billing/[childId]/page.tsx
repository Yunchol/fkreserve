"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useChildStore } from "@/stores/childStore";
import InvoicePreview from "@/components/InvoicePreview";

type Invoice = {
  id: string;
  month: string;
  total: number;
  note: string;
  finalizedAt: string;
  breakdown: any;
  weeklyCount: number;
};

export default function ParentBillingDetailPage(props: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = use(props.params); // ← ここでunwrap！

  const searchParams = useSearchParams();
  const month = searchParams.get("month");
  const router = useRouter();
  const { selectedChildId } = useChildStore();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [childName, setChildName] = useState("―");


  useEffect(() => {
    if (!month || !childId) return;

    const fetchInvoice = async () => {
      const res = await fetch(
        `/api/parent/invoice?childId=${childId}&month=${month}`
      );

      if (!res.ok) {
        router.push("/parent/billing");
        return;
      }

      const data = await res.json();
      setInvoice(data.invoice);
      setChildName(data.childName);
      setLoading(false);
    };

    fetchInvoice();
  }, [childId, month]);

  if (loading) {
    return <div className="p-4">読み込み中...</div>;
  }

  if (!invoice) {
    return <div className="p-4">請求書が見つかりませんでした。</div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">{invoice.month} の請求書</h1>

      <InvoicePreview
        invoiceId={invoice.id}
        childId={childId}
        childName={childName}
        month={invoice.month}
        breakdown={invoice.breakdown}
        weeklyCount={invoice.weeklyCount}
        note={invoice.note}
        finalizedAt={invoice.finalizedAt}
        readonly={true}
        showPrintButton={true}
      />
    </div>
  );
}
