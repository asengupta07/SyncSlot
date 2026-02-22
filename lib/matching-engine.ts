import { addMinutes, parseISO, getHours } from "date-fns";

export interface ParticipantAvailability {
  userId: string;
  userName: string;
  intervals: Array<{ start: string; end: string }>;
}

export interface MatchWindow {
  start: string;
  end: string;
  participants: string[];
  participantNames: string[];
  score: number;
  totalParticipants: number;
}

export interface MatchResult {
  windows: MatchWindow[];
  perfectMatch: boolean;
}

function parseIntervals(
  intervals: Array<{ start: string; end: string }>
): Array<{ start: Date; end: Date }> {
  return intervals.map((i) => ({
    start: parseISO(i.start),
    end: parseISO(i.end),
  }));
}

function intersectTwo(
  a: Array<{ start: Date; end: Date }>,
  b: Array<{ start: Date; end: Date }>
): Array<{ start: Date; end: Date }> {
  const result: Array<{ start: Date; end: Date }> = [];
  for (const ai of a) {
    for (const bi of b) {
      const start = ai.start > bi.start ? ai.start : bi.start;
      const end = ai.end < bi.end ? ai.end : bi.end;
      if (start < end) {
        result.push({ start, end });
      }
    }
  }
  return mergeIntervals(result);
}

function mergeIntervals(
  intervals: Array<{ start: Date; end: Date }>
): Array<{ start: Date; end: Date }> {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: Array<{ start: Date; end: Date }> = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    const last = merged[merged.length - 1];
    if (curr.start <= last.end) {
      last.end = curr.end > last.end ? curr.end : last.end;
    } else {
      merged.push(curr);
    }
  }
  return merged;
}

function businessHoursScore(date: Date): number {
  const h = getHours(date);
  if (h >= 9 && h < 12) return 1.1;
  if (h >= 14 && h < 17) return 1.05;
  return 1;
}

export function runMatchingEngine(
  participantAvailabilities: ParticipantAvailability[],
  options: {
    durationMinutes?: number;
    minParticipants?: number;
  } = {}
): MatchResult {
  const durationMinutes = options.durationMinutes ?? 30;
  const minParticipants = options.minParticipants ?? 1;
  const totalParticipants = participantAvailabilities.length;

  if (totalParticipants === 0) {
    return { windows: [], perfectMatch: false };
  }

  const parsed = participantAvailabilities.map((p) => ({
    userId: p.userId,
    userName: p.userName,
    intervals: parseIntervals(p.intervals),
  }));

  let perfectIntervals = parsed[0].intervals;
  for (let i = 1; i < parsed.length; i++) {
    perfectIntervals = intersectTwo(perfectIntervals, parsed[i].intervals);
  }

  if (perfectIntervals.length > 0) {
    const windows: MatchWindow[] = [];
    for (const interval of perfectIntervals) {
      const start = interval.start;
      const end = addMinutes(start, durationMinutes);
      if (end <= interval.end) {
        const sliceEnd = interval.end.getTime();
        let cursor = start.getTime();
        while (cursor + durationMinutes * 60 * 1000 <= sliceEnd) {
          const wStart = new Date(cursor);
          const wEnd = addMinutes(wStart, durationMinutes);
          const score = businessHoursScore(wStart);
          windows.push({
            start: wStart.toISOString(),
            end: wEnd.toISOString(),
            participants: participantAvailabilities.map((p) => p.userId),
            participantNames: participantAvailabilities.map((p) => p.userName),
            score: totalParticipants * score,
            totalParticipants,
          });
          cursor += 15 * 60 * 1000;
        }
      }
    }
    return {
      windows: windows.slice(0, 50),
      perfectMatch: true,
    };
  }

  const allStarts = new Set<number>();
  for (const p of parsed) {
    for (const i of p.intervals) {
      allStarts.add(i.start.getTime());
      allStarts.add(i.end.getTime());
    }
  }
  const sortedStarts = Array.from(allStarts).sort((a, b) => a - b);

  const partialWindows: MatchWindow[] = [];
  const durationMs = durationMinutes * 60 * 1000;

  for (let i = 0; i < sortedStarts.length - 1; i++) {
    const windowStart = sortedStarts[i];
    const windowEnd = windowStart + durationMs;
    if (windowEnd > sortedStarts[sortedStarts.length - 1]) break;

    const participants: string[] = [];
    const participantNames: string[] = [];

    for (const p of parsed) {
      const hasOverlap = p.intervals.some((interval) => {
        const iStart = interval.start.getTime();
        const iEnd = interval.end.getTime();
        return iStart <= windowStart && iEnd >= windowEnd;
      });
      if (hasOverlap) {
        participants.push(p.userId);
        participantNames.push(p.userName);
      }
    }

    if (participants.length >= minParticipants) {
      const score =
        participants.length * businessHoursScore(new Date(windowStart));
      partialWindows.push({
        start: new Date(windowStart).toISOString(),
        end: new Date(windowEnd).toISOString(),
        participants,
        participantNames,
        score,
        totalParticipants,
      });
    }
  }

  partialWindows.sort((a, b) => b.score - a.score);
  const deduped = partialWindows.filter((w, i) => {
    if (i === 0) return true;
    const prev = partialWindows[i - 1];
    return (
      w.start !== prev.start ||
      w.participants.length !== prev.participants.length
    );
  });

  return {
    windows: deduped.slice(0, 50),
    perfectMatch: false,
  };
}
