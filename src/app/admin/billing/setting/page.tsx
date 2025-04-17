"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function BillingSettingPage() {
  const [version, setVersion] = useState("2025春");

  const defaultBasicPrices = {
    "週1": 0,
    "週2": 0,
    "週3": 0,
    "週4": 0,
    "週5": 0,
  };

  const defaultSpotPrices = {
    "終日": 0,
    "午前のみ": 0,
    "午後のみ": 0,
  };

  const defaultOptionPrices = {
    lunch: 0,
    dinner: 0,
    school_car: 0,
    home_car: 0,
    lesson_car: 0,
  };

  const optionLabelMap: Record<string, string> = {
    lunch: "昼食",
    dinner: "夕食",
    school_car: "学校送迎",
    home_car: "自宅送迎",
    lesson_car: "習い事送迎",
  };

  const [basicPrices, setBasicPrices] = useState<Record<string, number>>(defaultBasicPrices);
  const [spotPrices, setSpotPrices] = useState<Record<string, number>>(defaultSpotPrices);
  const [optionPrices, setOptionPrices] = useState<Record<string, number>>(defaultOptionPrices);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch("/api/admin/billing/setting");
      const data = await res.json();

      if (data.latest) {
        setVersion(data.latest.version || "2025春");

        const mappedBasic = Object.fromEntries(
          Object.entries(data.latest.basicPrices || {}).map(([k, v]) => [`週${k}`, v])
        );

        const mappedSpot = {
          "終日": data.latest.spotPrices?.full ?? 0,
          "午前のみ": data.latest.spotPrices?.am ?? 0,
          "午後のみ": data.latest.spotPrices?.pm ?? 0,
        };

        setBasicPrices({ ...defaultBasicPrices, ...mappedBasic });
        setSpotPrices({ ...defaultSpotPrices, ...mappedSpot });
        setOptionPrices({ ...defaultOptionPrices, ...data.latest.optionPrices });
      }

      if (data.history) {
        setHistory(data.history);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async () => {
    const basic = Object.fromEntries(
      Object.entries(basicPrices).map(([k, v]) => [k.replace("週", ""), v])
    );
    const spot = {
      full: spotPrices["終日"],
      am: spotPrices["午前のみ"],
      pm: spotPrices["午後のみ"],
    };

    const res = await fetch("/api/admin/billing/setting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version, basicPrices: basic, spotPrices: spot, optionPrices }),
    });

    if (res.ok) {
      alert("料金設定を保存しました！");
      window.location.reload();
    } else if (res.status === 409) {
      alert("このバージョン名はすでに存在します");
    } else {
      alert("保存に失敗しました");
    }
  };

  const renderPriceSection = (
    title: string,
    prices: Record<string, number>,
    setPrices: React.Dispatch<React.SetStateAction<Record<string, number>>>,
    labelMap?: Record<string, string>
  ) => (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {Object.entries(prices).map(([key, value]) => (
          <div key={key} className="flex items-center gap-4">
            <Label className="w-32">{labelMap?.[key] ?? key}</Label>
            <Input
              type="number"
              value={value}
              onChange={(e) =>
                setPrices((prev) => ({
                  ...prev,
                  [key]: parseInt(e.target.value) || 0,
                }))
              }
              className="w-40"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">料金設定（管理者）</h1>

      <Card>
        <CardContent className="pt-4 space-y-2">
          <Label htmlFor="version" className="font-medium">バージョン名</Label>
          <Input
            id="version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="w-full max-w-sm"
          />
        </CardContent>
      </Card>

      {renderPriceSection("基本料金（週利用回数ごと）", basicPrices, setBasicPrices)}
      {renderPriceSection("スポット利用料金", spotPrices, setSpotPrices)}
      {renderPriceSection("オプション料金", optionPrices, setOptionPrices, optionLabelMap)}

      <div className="flex justify-end">
        <Button onClick={handleSubmit}>保存する</Button>
      </div>

      {/* {history.length > 1 && (
        <div className="mt-10 space-y-2">
          <h2 className="text-lg font-semibold">過去の料金設定履歴</h2>
          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2 text-left">バージョン</th>
                  <th className="p-2 text-left">作成日時</th>
                </tr>
              </thead>
              <tbody>
                {history.map((setting, index) => (
                  <tr key={setting.id} className="border-t">
                    <td className="p-2">{setting.version}</td>
                    <td className="p-2">
                      {new Date(setting.createdAt).toLocaleString()}
                      {index === 0 && (
                        <span className="text-blue-500 ml-2">(最新)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )} */}
    </div>
  );
}
