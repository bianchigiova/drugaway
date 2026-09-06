import { useStats } from "../hooks/useStats";
import { formatDate } from "../lib/days";

interface Props {
  onBack: () => void;
}

function dayLabel(n: number): string {
  return `${n} ${n === 1 ? "day" : "days"}`;
}

export default function StatsScreen({ onBack }: Props) {
  const stats = useStats();

  return (
    <section className="screen stats">
      <header className="screen-header">
        <button
          className="icon-button"
          onClick={onBack}
          aria-label="Back to home"
        >
          <BackIcon />
        </button>
        <h1>Stats</h1>
      </header>

      <div className="stat-list">
        <div className="stat-row">
          <span className="stat-label">Journey started</span>
          <span className="stat-value">{formatDate(stats.journeyStartISO)}</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">Longest time before relapse</span>
          <span className="stat-value">{dayLabel(stats.longestSpellDays)}</span>
          {stats.longestIsCurrent && stats.longestSpellDays > 0 && (
            <span className="stat-caption">That's your current streak.</span>
          )}
        </div>

        <div className="stat-row">
          <span className="stat-label">Average time before relapse</span>
          <span className="stat-value">
            {stats.averageSpellDays === null
              ? "—"
              : dayLabel(stats.averageSpellDays)}
          </span>
          {stats.relapseCount === 0 && (
            <span className="stat-caption">No relapses yet.</span>
          )}
        </div>

        <div className="stat-row">
          <span className="stat-label">Number of relapses</span>
          <span className="stat-value">{stats.relapseCount}</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">Times you changed your mind</span>
          <span className="stat-value">{stats.changedMindCount}</span>
        </div>
      </div>
    </section>
  );
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}
