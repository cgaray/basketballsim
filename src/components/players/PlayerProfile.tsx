/**
 * PlayerProfile
 *
 * Season-by-season player profile screen, built on the BasketballUI primitives
 * (Badge, Button, YearSelector). Ported from a design produced in Claude Design
 * (claude.ai/design) — see the "Player Profile" template in the Basketball Sim UI
 * design project.
 *
 * Interactivity preserved from the design: selecting a year (via the YearSelector
 * or by clicking a bar in the career chart) recomputes every stat, and an accent
 * theme can be swapped via the `accent` prop.
 *
 * Note: the design uses the "Oswald" (stat numerals) and "Public Sans" (body)
 * Google fonts. They are referenced with graceful fallbacks; load them (e.g. via
 * next/font) if you want the exact typography.
 */

'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { YearSelector } from '@/components/ui/year-selector';

type Season = {
  year: number;
  age: number;
  gp: number;
  min: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fg: number;
  tp: number;
  ft: number;
  per: number;
  ts: number;
  rec: string;
  playoff: string;
  awards: string[];
};

const SEASONS: Season[] = [
  { year: 2019, age: 21, gp: 68, min: 24.1, ppg: 11.2, rpg: 3.1, apg: 4.8, spg: 1.0, bpg: 0.2, fg: 43.1, tp: 34.2, ft: 78.0, per: 14.2, ts: 52.1, rec: '34–48', playoff: 'Missed', awards: ['All-Rookie 2nd'] },
  { year: 2020, age: 22, gp: 71, min: 30.5, ppg: 16.8, rpg: 3.6, apg: 6.2, spg: 1.3, bpg: 0.3, fg: 45.0, tp: 36.8, ft: 81.2, per: 17.9, ts: 55.3, rec: '41–41', playoff: 'R1 Exit', awards: ['Most Improved'] },
  { year: 2021, age: 23, gp: 66, min: 33.2, ppg: 21.4, rpg: 4.1, apg: 7.1, spg: 1.5, bpg: 0.3, fg: 46.2, tp: 37.9, ft: 83.5, per: 21.0, ts: 57.8, rec: '47–35', playoff: 'Conf Semis', awards: ['All-Star'] },
  { year: 2022, age: 24, gp: 70, min: 34.0, ppg: 24.9, rpg: 4.6, apg: 8.0, spg: 1.6, bpg: 0.4, fg: 47.1, tp: 38.5, ft: 85.0, per: 23.8, ts: 59.1, rec: '52–30', playoff: 'Conf Finals', awards: ['All-Star', 'All-NBA 3rd'] },
  { year: 2023, age: 25, gp: 63, min: 34.6, ppg: 27.1, rpg: 5.0, apg: 8.4, spg: 1.7, bpg: 0.4, fg: 47.8, tp: 39.1, ft: 86.2, per: 25.6, ts: 60.4, rec: '49–33', playoff: 'Conf Semis', awards: ['All-Star', 'All-NBA 2nd'] },
  { year: 2024, age: 26, gp: 74, min: 35.1, ppg: 29.6, rpg: 5.4, apg: 9.1, spg: 1.8, bpg: 0.5, fg: 48.9, tp: 40.2, ft: 87.5, per: 27.9, ts: 62.0, rec: '58–24', playoff: 'NBA Finals', awards: ['All-Star', 'All-NBA 1st', 'MVP Finalist'] },
];

const BEST_YEAR = 2024;

const ACCENTS: Record<string, [string, string]> = {
  'Court Orange': ['#E8703A', 'rgba(232,112,58,0.13)'],
  Royal: ['#2D6BE0', 'rgba(45,107,224,0.13)'],
  Emerald: ['#128760', 'rgba(18,135,96,0.13)'],
  Crimson: ['#D33F49', 'rgba(211,63,73,0.13)'],
};

const one = (n: number) => (Math.round(n * 10) / 10).toFixed(1);

type Delta = { text: string; color: string; arrow: string };
const delta = (cur: number, prevVal: number | null | undefined): Delta => {
  if (prevVal == null) return { text: 'Rookie yr', color: 'var(--muted-foreground)', arrow: '' };
  const d = cur - prevVal;
  const r = (Math.round(Math.abs(d) * 10) / 10).toFixed(1);
  if (Math.abs(d) < 0.05) return { text: 'even', color: 'var(--muted-foreground)', arrow: '' };
  if (d > 0) return { text: '+' + r, color: '#16a34a', arrow: '▲' };
  return { text: '−' + r, color: '#dc2626', arrow: '▼' };
};

export interface PlayerProfileProps {
  /** Toggle the dark token theme. */
  dark?: boolean;
  /** Accent theme (drives the --brand tokens). */
  accent?: keyof typeof ACCENTS;
}

const cardStyle: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: 22,
  boxShadow: '0 1px 2px rgba(0,0,0,0.04),0 12px 34px -20px rgba(0,0,0,0.28)',
};
const kickerStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
};
const oswald = "var(--font-oswald), 'Oswald', sans-serif";

export function PlayerProfile({ dark = false, accent = 'Court Orange' }: PlayerProfileProps) {
  const [year, setYear] = useState(BEST_YEAR);

  const years = SEASONS.map((s) => s.year);
  const idx = Math.max(0, SEASONS.findIndex((s) => s.year === year));
  const s = SEASONS[idx];
  const prev = idx > 0 ? SEASONS[idx - 1] : null;
  const [brand, brandSoft] = ACCENTS[accent] ?? ACCENTS['Court Orange'];

  const tiles = [
    { label: 'PPG', value: one(s.ppg), delta: delta(s.ppg, prev?.ppg) },
    { label: 'RPG', value: one(s.rpg), delta: delta(s.rpg, prev?.rpg) },
    { label: 'APG', value: one(s.apg), delta: delta(s.apg, prev?.apg) },
    { label: 'SPG', value: one(s.spg), delta: delta(s.spg, prev?.spg) },
    { label: 'BPG', value: one(s.bpg), delta: delta(s.bpg, prev?.bpg) },
  ];

  const maxScale = 32;
  const bars = SEASONS.map((x) => {
    const active = x.year === year;
    const isBest = x.year === BEST_YEAR;
    return {
      year: x.year,
      label: String(x.year - 1).slice(2) + '–' + String(x.year).slice(2),
      ppg: one(x.ppg),
      h: Math.max(8, Math.round((x.ppg / maxScale) * 100)),
      barBg: active ? 'var(--brand)' : isBest ? 'var(--brand-soft)' : 'var(--muted)',
      barBorder: active ? '1px solid transparent' : isBest ? '1px solid var(--brand)' : '1px solid transparent',
      numColor: active ? 'var(--brand)' : 'var(--muted-foreground)',
      labelColor: active ? 'var(--foreground)' : 'var(--muted-foreground)',
    };
  });

  const splits = [
    { label: 'Field Goal', pct: one(s.fg), w: s.fg },
    { label: '3-Point', pct: one(s.tp), w: s.tp },
    { label: 'Free Throw', pct: one(s.ft), w: s.ft },
  ];

  const seasonLabel = s.year - 1 + '–' + String(s.year).slice(2);

  const opps = ['@ Miami Sharks', 'vs Boston Reds', '@ Denver Peaks', 'vs Phoenix Sol', '@ Dallas Stars'];
  const res = ['W', 'W', 'L', 'W', 'W'];
  const pm = ['+12', '+6', '−8', '+3', '+15'];
  const scoreLine = ['128–119', '114–108', '101–109', '122–117', '133–121'];
  const mp = [1.18, 0.9, 1.3, 0.94, 1.06];
  const mr = [1.2, 0.8, 1.1, 1.0, 1.35];
  const ma = [1.1, 1.25, 0.7, 1.0, 1.2];
  const games = opps.map((o, i) => ({
    opp: o,
    res: res[i],
    score: scoreLine[i],
    min: Math.round(s.min),
    pts: Math.round(s.ppg * mp[i]),
    reb: Math.round(s.rpg * mr[i]),
    ast: Math.round(s.apg * ma[i]),
    pm: pm[i],
    resultBg: res[i] === 'W' ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
    resultColor: res[i] === 'W' ? '#16a34a' : '#dc2626',
    pmColor: pm[i].charAt(0) === '−' ? '#dc2626' : '#16a34a',
  }));

  const summary = [
    { k: 'Games Played', v: s.gp + ' / 82' },
    { k: 'Minutes / Game', v: one(s.min) },
    { k: 'Team Record', v: s.rec },
    { k: 'Postseason', v: s.playoff },
    { k: 'PER', v: one(s.per) },
    { k: 'True Shooting', v: one(s.ts) + '%' },
  ];

  const badges = s.awards.map((a) => ({ label: a }));
  const isPeak = year === BEST_YEAR;

  const gamesGrid = '1.9fr 0.8fr 0.6fr 0.6fr 0.6fr 0.6fr 0.7fr';

  return (
    <div
      className={dark ? 'dark' : ''}
      style={{
        minHeight: '100vh',
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: "var(--font-public-sans), 'Public Sans', system-ui, -apple-system, sans-serif",
        // Accent tokens consumed by the markup below.
        ['--brand' as string]: brand,
        ['--brand-soft' as string]: brandSoft,
      } as React.CSSProperties}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          padding: '13px 32px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--card)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: 'var(--brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontFamily: oswald,
                fontWeight: 700,
                fontSize: 20,
              }}
            >
              H
            </div>
            <div style={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: 17 }}>
              HARDWOOD<span style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}> GM</span>
            </div>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            {[
              ['Roster', false],
              ['Standings', false],
              ['Players', true],
              ['Schedule', false],
              ['Trades', false],
            ].map(([label, active]) => (
              <button
                key={label as string}
                style={{
                  appearance: 'none',
                  border: 0,
                  background: 'transparent',
                  font: 'inherit',
                  cursor: 'pointer',
                  padding: '6px 0',
                  fontSize: 14,
                  fontWeight: active ? 700 : 600,
                  color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                  borderBottom: `2px solid ${active ? 'var(--brand)' : 'transparent'}`,
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            style={{
              appearance: 'none',
              border: 0,
              cursor: 'pointer',
              font: 'inherit',
              background: 'var(--brand)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              padding: '9px 16px',
              borderRadius: 10,
              boxShadow: '0 6px 16px -8px var(--brand)',
            }}
          >
            Sim Next Game
          </button>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13,
              color: 'var(--muted-foreground)',
            }}
          >
            GM
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        {/* Hero */}
        <section style={{ display: 'flex', gap: 26, alignItems: 'center', padding: '30px 32px 22px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 104, height: 104, flex: 'none' }}>
            <div
              style={{
                width: 104,
                height: 104,
                borderRadius: 22,
                background: 'linear-gradient(150deg,var(--brand),color-mix(in srgb,var(--brand) 55%,#101010))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontFamily: oswald,
                fontWeight: 600,
                fontSize: 44,
                letterSpacing: '0.02em',
                boxShadow: '0 16px 34px -14px var(--brand)',
              }}
            >
              MV
            </div>
            <div
              style={{
                position: 'absolute',
                right: -9,
                bottom: -9,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 11,
                padding: '2px 10px',
                fontFamily: oswald,
                fontWeight: 600,
                fontSize: 18,
                boxShadow: '0 4px 12px -6px rgba(0,0,0,0.4)',
              }}
            >
              #4
            </div>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>Marcus Vane</h1>
              {isPeak && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: 'var(--brand)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '5px 11px',
                    borderRadius: 999,
                  }}
                >
                  ★ Peak Season
                </span>
              )}
            </div>
            <div style={{ marginTop: 9, color: 'var(--muted-foreground)', fontWeight: 600, fontSize: 15 }}>
              Point Guard · #4 · Coastal Kings
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 15, flexWrap: 'wrap' }}>
              {badges.map((b) => (
                <Badge key={b.label} variant="secondary">
                  {b.label}
                </Badge>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-end' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={kickerStyle}>Season</div>
              <div style={{ fontFamily: oswald, fontWeight: 600, fontSize: 32, lineHeight: 1.05 }}>{seasonLabel}</div>
            </div>
            <div style={{ display: 'flex', gap: 9 }}>
              <Button variant="outline" size="sm">
                Full Profile
              </Button>
              <Button variant="secondary" size="sm">
                Compare
              </Button>
            </div>
          </div>
        </section>

        <div style={{ padding: '6px 32px 52px', display: 'grid', gridTemplateColumns: '296px 1fr', gap: 22, alignItems: 'start' }}>
          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <section style={cardStyle}>
              <p style={kickerStyle}>Season</p>
              <div style={{ marginTop: 14 }}>
                <YearSelector
                  availableYears={years}
                  selectedYear={year}
                  bestYear={BEST_YEAR}
                  onYearChange={(y) => setYear(Number(y))}
                />
              </div>
              <p style={{ margin: '14px 0 0', fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                The player&apos;s peak statistical season is flagged automatically.
              </p>
            </section>

            <section style={cardStyle}>
              <p style={kickerStyle}>Season Summary</p>
              <div style={{ marginTop: 8 }}>
                {summary.map((row) => (
                  <div
                    key={row.k}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px solid var(--border)',
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: 'var(--muted-foreground)' }}>{row.k}</span>
                    <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </section>

            <section style={cardStyle}>
              <p style={{ ...kickerStyle, margin: '0 0 14px' }}>{seasonLabel} Accolades</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {badges.map((b) => (
                  <span
                    key={b.label}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'var(--brand-soft)',
                      color: 'var(--brand)',
                      fontWeight: 700,
                      fontSize: 12,
                      padding: '6px 11px',
                      borderRadius: 999,
                    }}
                  >
                    ★ {b.label}
                  </span>
                ))}
              </div>
            </section>
          </aside>

          {/* Main */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
            {/* Stat tiles */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
              {tiles.map((t) => (
                <div
                  key={t.label}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: '18px 14px',
                    textAlign: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04),0 12px 34px -22px rgba(0,0,0,0.28)',
                  }}
                >
                  <div style={{ fontFamily: oswald, fontWeight: 600, fontSize: 44, lineHeight: 1, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
                    {t.value}
                  </div>
                  <div style={{ marginTop: 9, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>{t.label}</div>
                  <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: t.delta.color }}>
                    {t.delta.arrow} {t.delta.text}
                  </div>
                </div>
              ))}
            </section>

            {/* Shooting Splits */}
            <section style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <p style={kickerStyle}>Shooting Splits</p>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-foreground)' }}>
                  TS% <span style={{ fontFamily: oswald, fontSize: 15, color: 'var(--foreground)' }}>{one(s.ts)}%</span>
                </span>
              </div>
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {splits.map((sp) => (
                  <div key={sp.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted-foreground)' }}>{sp.label}</span>
                      <span style={{ fontFamily: oswald, fontWeight: 600, fontSize: 16, fontVariantNumeric: 'tabular-nums' }}>{sp.pct}%</span>
                    </div>
                    <div style={{ height: 10, borderRadius: 999, background: 'var(--muted)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${sp.w}%`, background: 'var(--brand)', borderRadius: 999, transition: 'width .3s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Career Scoring Progression */}
            <section style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                <p style={kickerStyle}>Career Scoring Progression</p>
                <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>PPG by season · click a bar to explore</span>
              </div>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'flex-end', gap: 16, height: 188 }}>
                {bars.map((bar) => (
                  <div
                    key={bar.year}
                    onClick={() => setYear(bar.year)}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, cursor: 'pointer', height: '100%', justifyContent: 'flex-end' }}
                  >
                    <div style={{ fontFamily: oswald, fontWeight: 600, fontSize: 14, fontVariantNumeric: 'tabular-nums', color: bar.numColor }}>{bar.ppg}</div>
                    <div style={{ width: '100%', height: `${bar.h}%`, borderRadius: '8px 8px 3px 3px', background: bar.barBg, border: bar.barBorder, transition: 'height .3s ease,background .15s ease' }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: bar.labelColor }}>{bar.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Games */}
            <section style={cardStyle}>
              <p style={{ ...kickerStyle, margin: '0 0 6px' }}>Recent Games · {seasonLabel}</p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: gamesGrid,
                  alignItems: 'center',
                  padding: '10px 4px',
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--muted-foreground)',
                }}
              >
                <div>Matchup</div>
                <div>Result</div>
                <div style={{ textAlign: 'right' }}>Min</div>
                <div style={{ textAlign: 'right' }}>Pts</div>
                <div style={{ textAlign: 'right' }}>Reb</div>
                <div style={{ textAlign: 'right' }}>Ast</div>
                <div style={{ textAlign: 'right' }}>+/-</div>
              </div>
              {games.map((g, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: gamesGrid,
                    alignItems: 'center',
                    padding: '12px 4px',
                    borderTop: '1px solid var(--border)',
                    fontSize: 14,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>
                    {g.opp} <span style={{ color: 'var(--muted-foreground)', fontWeight: 500, fontSize: 12 }}>{g.score}</span>
                  </div>
                  <div>
                    <span style={{ display: 'inline-block', minWidth: 22, textAlign: 'center', background: g.resultBg, color: g.resultColor, fontWeight: 800, fontSize: 12, padding: '3px 8px', borderRadius: 7 }}>{g.res}</span>
                  </div>
                  <div style={{ textAlign: 'right', color: 'var(--muted-foreground)' }}>{g.min}</div>
                  <div style={{ textAlign: 'right', fontFamily: oswald, fontWeight: 600, fontSize: 16 }}>{g.pts}</div>
                  <div style={{ textAlign: 'right' }}>{g.reb}</div>
                  <div style={{ textAlign: 'right' }}>{g.ast}</div>
                  <div style={{ textAlign: 'right', fontWeight: 700, color: g.pmColor }}>{g.pm}</div>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
