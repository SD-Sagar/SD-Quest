import { PlayerProfile, CalendarDayEntry, LoggedMealItem, WorkoutSetLog } from "@/types";

export interface MonthlyReportPayload {
  yearMonth: string; // e.g. "2026-11"
  player: PlayerProfile;
  days: Record<string, CalendarDayEntry>;
  totalTonnageKg: number;
  totalWorkouts: number;
  totalQuests: number;
  averageDiscipline: number;
}

/**
 * Generates and triggers instant browser download of a formatted CSV report for a given month.
 */
export function downloadMonthlyCSV(payload: MonthlyReportPayload) {
  const { yearMonth, player, days, totalTonnageKg, totalWorkouts, totalQuests, averageDiscipline } =
    payload;

  const lines: string[] = [];

  // Header & Player Snapshot
  lines.push(`SD-QUEST REAL-LIFE RPG // MONTHLY PERFORMANCE REPORT`);
  lines.push(`Report Period,${yearMonth}`);
  lines.push(`Player Name,${player.name}`);
  lines.push(`Hunter Rank,${player.rank}`);
  lines.push(`Current Level,LVL ${player.currentLevel}`);
  lines.push(`Lifetime Peak Level,LVL ${player.lifetimeHighestLevel}`);
  lines.push(`Average Discipline Score,${averageDiscipline.toFixed(1)} / 100`);
  lines.push(``);

  // Summary Metrics
  lines.push(`MONTHLY AGGREGATE TELEMETRY`);
  lines.push(`Total Gym Workouts Completed,${totalWorkouts}`);
  lines.push(`Total Volume Tonnage Moved (KG),${totalTonnageKg.toLocaleString()} KG`);
  lines.push(`Total Quests Completed,${totalQuests}`);
  lines.push(`Retention Rule,Detailed records preserved for 180 days before permanent snapshot archival.`);
  lines.push(``);

  // Daily Ledger
  lines.push(`DAILY ACTIVITY LEDGER`);
  lines.push(`Date,Day Status,Gym Workout,Skipping Objective,Quests Completed,Water Target,Journal Notes`);

  const monthEntries = Object.values(days)
    .filter((d) => d.date.startsWith(yearMonth))
    .sort((a, b) => a.date.localeCompare(b.date));

  for (const entry of monthEntries) {
    const cleanNotes = (entry.notes || "").replace(/"/g, '""');
    lines.push(
      `"${entry.date}","${entry.status.toUpperCase()}","${
        entry.gymWorkoutCompleted ? "YES" : "NO"
      }","${entry.skippingCompleted ? "100+ DONE" : "OFF"}","${entry.questsCompletedCount} / ${
        entry.totalQuestsCount
      }","${entry.waterTargetMet ? "YES" : "NO"}","${cleanNotes}"`
    );
  }

  const csvContent = lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `SD-Quest-Report-${yearMonth}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens a print-friendly, cleanly formatted PDF view of the monthly report.
 */
export function openPrintableMonthlyReport(payload: MonthlyReportPayload) {
  const { yearMonth, player, days, totalTonnageKg, totalWorkouts, totalQuests, averageDiscipline } =
    payload;

  const monthEntries = Object.values(days)
    .filter((d) => d.date.startsWith(yearMonth))
    .sort((a, b) => a.date.localeCompare(b.date));

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>SD-Quest Monthly Performance Report — ${yearMonth}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; color: #111; padding: 30px; }
          h1 { margin: 0 0 5px 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
          .tagline { color: #555; font-size: 13px; margin-bottom: 20px; font-weight: bold; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
          .card { border: 1px solid #ddd; padding: 12px; border-radius: 8px; background: #fcfcfc; }
          .card span { font-size: 11px; color: #666; display: block; text-transform: uppercase; font-weight: bold; }
          .card strong { font-size: 18px; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th, td { border: 1px solid #e0e0e0; padding: 8px 10px; text-align: left; }
          th { background: #f5f5f5; font-weight: bold; text-transform: uppercase; font-size: 10px; }
          .green { color: #059669; font-weight: bold; }
          .rest { color: #4b5563; }
          .red { color: #dc2626; font-weight: bold; }
          .footer { margin-top: 30px; font-size: 10px; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>SD-QUEST // MONTHLY HUNTER REPORT</h1>
        <div class="tagline">PERIOD: ${yearMonth} • HUNTER: ${player.name} (${player.rank} - LVL ${player.currentLevel})</div>

        <div class="grid">
          <div class="card">
            <span>Workouts Done</span>
            <strong>${totalWorkouts} Sessions</strong>
          </div>
          <div class="card">
            <span>Total Tonnage</span>
            <strong>${totalTonnageKg.toLocaleString()} KG</strong>
          </div>
          <div class="card">
            <span>Quests Completed</span>
            <strong>${totalQuests} Quests</strong>
          </div>
          <div class="card">
            <span>Discipline Rating</span>
            <strong>${averageDiscipline.toFixed(1)} / 100</strong>
          </div>
        </div>

        <h3>DAILY ACTIVITY TELEMETRY LEDGER</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Gym Workout</th>
              <th>Skipping</th>
              <th>Quests Done</th>
              <th>Water Met</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${monthEntries
              .map(
                (e) => `
              <tr>
                <td><strong>${e.date}</strong></td>
                <td class="${e.status === "green" ? "green" : e.status === "red" ? "red" : "rest"}">
                  ${e.status.toUpperCase()}
                </td>
                <td>${e.gymWorkoutCompleted ? "Completed ✓" : "Rest / Off"}</td>
                <td>${e.skippingCompleted ? "100+ Skips ✓" : "—"}</td>
                <td>${e.questsCompletedCount} / ${e.totalQuestsCount}</td>
                <td>${e.waterTargetMet ? "Yes ✓" : "No"}</td>
                <td>${e.notes || "—"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          Permanent Player Record preserved. Detailed 180-day activity retention rules compliant. Generated by SD-Quest Real-Life RPG Engine.
        </div>

        <script>
          window.print();
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

