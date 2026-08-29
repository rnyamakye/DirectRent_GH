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
            className={`px-3 py-2 sm:px-4 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === "views"
                ? "bg-primary text-white"
                : "bg-card text-body hover:bg-border/50 border border-border"
            }`}
            title="Profile Views"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <span className="hidden sm:inline">Profile Views</span>
          </button>
          <button
            onClick={() => setActiveTab("earnings")}
            className={`px-3 py-2 sm:px-4 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === "earnings"
                ? "bg-primary text-white"
                : "bg-card text-body hover:bg-border/50 border border-border"
            }`}
            title="Earnings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            <span className="hidden sm:inline">Earnings</span>
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
