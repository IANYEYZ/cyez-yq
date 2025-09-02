"use client";

import {
  Chart as ChartJS,
  LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function FundChart({ labels, data }: { labels: string[]; data: number[] }) {
  return (
    <div className="h-64">
      <Line
        data={{
          labels,
          datasets: [{ label: "Balance (USD)", data, tension: 0.25 }]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { ticks: { callback: (v) => `$${Number(v).toFixed(0)}` } }
          }
        }}
      />
    </div>
  );
}
