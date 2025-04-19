"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PendingPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl">承認待ち</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-gray-700">
          <p>現在、管理者による承認待ちです。</p>
          <p>しばらくお待ちください。</p>
          <Button onClick={handleLogout} className="w-full">
            ログアウト
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
