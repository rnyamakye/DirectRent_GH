"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface ChartDataPoint {
  date: string;
  views: number;
  earnings: number;
}

export function AnalyticsCharts({ data }: { data: ChartDataPoint[] }) {
  const [activeTab, setActiveTab] = useState<"views" | "earnings">("views");

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-2xl font-semibold text-heading">Analytics</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("views")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === "views"
                ? "bg-primary text-white"
                : "bg-card text-body hover:bg-border/50 border border-border"
            }`}
          >
            Profile Views
          </button>
          <button
            onClick={() => setActiveTab("earnings")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === "earnings"
                ? "bg-primary text-white"
                : "bg-card text-body hover:bg-border/50 border border-border"
            }`}
          >
            Earnings
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "views" ? (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                name="Views"
                stroke="#2563EB" // DirectRent primary blue roughly, but let's use the CSS variable if possible, or just a nice blue. We'll stick to a nice blue hex for recharts.
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                tickFormatter={(value) => `GHS ${value}`}
              />
              <Tooltip
                cursor={{ fill: "#F3F4F6" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: any) => [`GHS ${value}`, "Earnings"]}
              />
              <Bar dataKey="earnings" name="Earnings" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
