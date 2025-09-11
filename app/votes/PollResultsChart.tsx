"use client";

import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function PollResultsChart({ labels, counts }: { labels: string[]; counts: number[] }) {
  return (
    <div className="h-40">
      <Bar
        data={{
          labels,
          datasets: [{ label: "Votes", data: counts }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { autoSkip: false } },
            y: { beginAtZero: true },
          },
        }}
      />
    </div>
  );
}
