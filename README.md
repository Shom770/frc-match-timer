# FRC Match Timer

A clean Next.js application for timing FRC Rebuilt Game matches.

## Features

- **20 seconds** autonomous period
- **10 seconds** transition period (everyone can score)
- **4 shifts** of 25 seconds each (alternating active/inactive based on auto winner)
- **30 seconds** endgame period
- **Total match time**: 2:40 (160 seconds)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the timer.

## How to Use

1. Before starting the match, select who wins autonomous (Our Alliance or Opposing Alliance)
2. Click "Start Match" to begin the timer
3. The timer will automatically progress through all phases:
   - Autonomous (20s)
   - Transition (10s)
   - 4 Alliance Shifts (25s each, alternating active/inactive)
   - Endgame (30s)
4. Use Pause/Resume to control the timer during the match
5. Use Reset to start over

## Match Logic

- If **Our Alliance** wins auto:
  - Shift 1: Inactive (Opposing gets first active period)
  - Shift 2: Active (Our alliance)
  - Shift 3: Inactive (Opposing)
  - Shift 4: Active (Our alliance)

- If **Opposing Alliance** wins auto:
  - Shift 1: Active (Our alliance gets first active period)
  - Shift 2: Inactive (Opposing)
  - Shift 3: Active (Our alliance)
  - Shift 4: Inactive (Opposing)

## Deployment to Vercel

This project is ready to deploy to Vercel:

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and configure the build settings
4. Click "Deploy" and your app will be live!

Alternatively, use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

