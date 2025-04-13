"use client";

import { useEffect, useState } from "react";

export default function BillingSettingPage() {
  const [version, setVersion] = useState("2025春");

  // ✅ 初期値を定義
  const defaultBasicPrices = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  const defaultSpotPrices = { full: 0, am: 0, pm: 0 };
  const defaultOptionPrices = {
    lunch: 0,
    dinner: 0,
    school_car: 0,
    home_car: 0,
    lesson_car: 0,
  };

  const [basicPrices, setBasicPrices] = useState<Record<string, number>>(defaultBasicPrices);
  const [spotPrices, setSpotPrices] = useState<Record<string, number>>(defaultSpotPrices);
  const [optionPrices, setOptionPrices] = useState<Record<string, number>>(defaultOptionPrices);
  const [history, setHistory] = useState<any[]>([]);

  // 🔸 最新の設定＆履歴取得
  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch("/api/admin/billing/setting");
      const data = await res.json();

      if (data.latest) {
        setVersion(data.latest.version || "2025春");
        setBasicPrices({ ...defaultBasicPrices, ...data.latest.basicPrices });
        setSpotPrices({ ...defaultSpotPrices, ...data.latest.spotPrices });
        setOptionPrices({ ...defaultOptionPrices, ...data.latest.optionPrices });
      } else {
        setBasicPrices(defaultBasicPrices);
        setSpotPrices(defaultSpotPrices);
        setOptionPrices(defaultOptionPrices);
      }

      if (data.history) {
        setHistory(data.history);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async () => {
    const res = await fetch("/api/admin/billing/setting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version, basicPrices, spotPrices, optionPrices }),
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

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">料金設定（管理者）</h1>

      {/* バージョン名 */}
      <div>
        <label className="block font-medium mb-1">バージョン名</label>
        <input
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* 基本料金 */}
      <div>
        <label className="block font-medium mb-1">基本料金（週利用回数ごと）</label>
        {Object.entries(basicPrices).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 mb-1">
            <span>週{key}回:</span>
            <input
              type="number"
              value={val}
              onChange={(e) =>
                setBasicPrices((prev) => ({
                  ...prev,
                  [key]: parseInt(e.target.value) || 0,
                }))
              }
              className="border p-1 rounded w-32"
            />
          </div>
        ))}
      </div>

      {/* スポット料金 */}
      <div>
        <label className="block font-medium mb-1">スポット利用</label>
        {Object.entries(spotPrices).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 mb-1">
            <span>{key}:</span>
            <input
              type="number"
              value={val}
              onChange={(e) =>
                setSpotPrices((prev) => ({
                  ...prev,
                  [key]: parseInt(e.target.value) || 0,
                }))
              }
              className="border p-1 rounded w-32"
            />
          </div>
        ))}
      </div>

      {/* オプション料金 */}
      <div>
        <label className="block font-medium mb-1">オプション</label>
        {Object.entries(optionPrices).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 mb-1">
            <span>{key}:</span>
            <input
              type="number"
              value={val}
              onChange={(e) =>
                setOptionPrices((prev) => ({
                  ...prev,
                  [key]: parseInt(e.target.value) || 0,
                }))
              }
              className="border p-1 rounded w-32"
            />
          </div>
        ))}
      </div>

      {/* 保存ボタン */}
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        保存する
      </button>

      {/* 履歴一覧 */}
      {history.length > 1 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-2">過去の料金設定履歴</h2>
          <div className="border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
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
                      {index === 0 && <span className="text-blue-500 ml-2">(最新)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
