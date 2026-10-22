"use client";

import { useEffect, useState } from "react";

const units = [
  { label: "Days", milliseconds: 86_400_000 },
  { label: "Hours", milliseconds: 3_600_000 },
  { label: "Minutes", milliseconds: 60_000 },
  { label: "Seconds", milliseconds: 1_000 },
];

function getRemainingTime(targetTime: number, currentTime: number) {
  let remaining = Math.max(0, targetTime - currentTime);

  return units.map(({ label, milliseconds }) => {
    const value = Math.floor(remaining / milliseconds);
    remaining %= milliseconds;
    return { label, value };
  });
}

export function Countdown({ dateTime }: { dateTime: string }) {
  const targetTime = Date.parse(dateTime);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const isPast = currentTime !== null && targetTime <= currentTime;
  const remainingTime =
    currentTime === null
      ? units.map(({ label }) => ({ label, value: null }))
      : getRemainingTime(targetTime, currentTime);

  return (
    <div className="countdown-band" aria-label="Countdown to the wedding">
      <p className="countdown-title">
        {isPast ? "Our forever has begun" : "Counting down to our forever"}
      </p>
      <div className="countdown" aria-live="off">
        {remainingTime.map(({ label, value }) => (
          <div className="countdown-item" key={label}>
            <span
              className="countdown-value"
              aria-label={
                value === null ? "Countdown loading" : `${value} ${label.toLowerCase()}`
              }
            >
              {value === null ? "—" : String(value).padStart(2, "0")}
            </span>
            <span className="countdown-label" aria-hidden="true">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
