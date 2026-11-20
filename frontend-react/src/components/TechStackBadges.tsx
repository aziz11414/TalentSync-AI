export function TechStackBadges() {
  const stack = [
    { name: "React 19", icon: "react", color: "61DAFB", category: "Frontend" },
    { name: "TypeScript", icon: "typescript", color: "3178C6", category: "Language" },
    { name: "Vite", icon: "vite", color: "646CFF", category: "Build" },
    { name: "FastAPI", icon: "fastapi", color: "009688", category: "Microservice" },
    { name: "Python 3.11", icon: "python", color: "3776AB", category: "AI & Parsing" },
    { name: "Laravel 13", icon: "laravel", color: "FF2D20", category: "Backend" },
    { name: "PHP 8.4", icon: "php", color: "777BB4", category: "Runtime" },
    { name: "SQLite", icon: "sqlite", color: "003B57", category: "Database" },
    { name: "PostgreSQL", icon: "postgresql", color: "4169E1", category: "Production DB" },
    { name: "Docker", icon: "docker", color: "2496ED", category: "DevOps" },
    { name: "Tailwind CSS", icon: "tailwindcss", color: "06B6D4", category: "Styles" },
    { name: "Git", icon: "git", color: "F05032", category: "VCS" },
  ];

  return (
    <div className="entity-card" style={{ marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h2>Architecture & Technologies</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Stack moderne découplée : Frontend React, Backend Laravel & Microservice IA FastAPI
          </p>
        </div>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            padding: "4px 12px",
            background: "var(--accent-light)",
            color: "var(--primary)",
            borderRadius: "var(--radius-pill)",
          }}
        >
          Cloud Ready
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
          gap: "12px",
          marginTop: "16px",
        }}
      >
        {stack.map((item) => (
          <div
            key={item.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-xs)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
          >
            <img
              src={`https://cdn.simpleicons.org/${item.icon}/${item.color}`}
              alt={item.name}
              width="22"
              height="22"
              style={{ flexShrink: 0 }}
              loading="lazy"
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>
                {item.name}
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                {item.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
