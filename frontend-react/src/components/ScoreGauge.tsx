interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function ScoreGauge({
  score,
  size = 72,
  strokeWidth = 7,
  showLabel = false,
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const offset = circumference - (clampedScore / 100) * circumference;

  let strokeColor = "#F43F5E";
  let labelText = "Faible";
  let labelBg = "#FFF1F2";
  let labelColor = "#E11D48";

  if (clampedScore >= 75) {
    strokeColor = "#10B981";
    labelText = "Top Match";
    labelBg = "#ECFDF5";
    labelColor = "#047857";
  } else if (clampedScore >= 50) {
    strokeColor = "#F59E0B";
    labelText = "Compatible";
    labelBg = "#FFFBEB";
    labelColor = "#B45309";
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(15, 23, 42, 0.08)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        </svg>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: size >= 70 ? "18px" : "14px",
            color: "var(--text-primary)",
            fontFamily: "var(--font-display)",
          }}
        >
          {clampedScore}%
        </div>
      </div>

      {showLabel && (
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "999px",
            background: labelBg,
            color: labelColor,
            letterSpacing: "0.02em",
          }}
        >
          {labelText}
        </span>
      )}
    </div>
  );
}
