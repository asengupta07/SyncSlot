# SyncSlot

Find the best time for everyone. Mark your availability and let SyncSlot compute when everyone can meet—or the optimal partial overlap when full overlap isn't possible.

## Features

- Create groups with shareable join codes and links
- 14-day availability calendar with click-and-drag selection
- AI-backed matching: perfect overlap first, then best partial overlap
- Heatmap and ranked list views
- Group creator can finalise a meeting time

## Tech Stack

- Next.js 16 (App Router)
- MongoDB + Mongoose
- TypeScript
- Tailwind CSS
- Bun

## Setup

1. Install dependencies:

```bash
bun install
```

2. Copy `.env.example` to `.env.local` and set your MongoDB URI:

```bash
cp .env.example .env.local
```

3. Ensure MongoDB is running (local or Atlas).

4. Start the dev server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. **Create a group** – Enter your name and group name. Share the join code or link.
2. **Join a group** – Enter your name and the join code (or use the link).
3. **Mark availability** – Click and drag on the calendar to select your free time.
4. **View results** – See heatmap and ranked list of best times.
5. **Finalise** – Group creator selects and confirms a time.
