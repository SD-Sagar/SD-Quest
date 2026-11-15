import { AttributeType, HunterRank, QuestCategory, QuestClassification } from "@/types";
import { calculateFairQuestXp, calculateFairStatYield } from "./rpg";

export interface ParsedQuestResult {
  title: string;
  description: string;
  category: QuestCategory;
  classification: QuestClassification;
  startDate: string;
  deadline?: string | null;
  recurrence: "none" | "daily" | "weekly" | "weekdays" | "custom";
  recurrence_days: number[];
  durationMinutes: number;
  priority: "low" | "medium" | "high" | "urgent";
  difficulty: HunterRank;
  relevantAttributes: AttributeType[];
  attributeRewards: Record<AttributeType, number>;
  xpReward: number;
}

/**
 * Parses free-form natural language text into a structured quest with fair attributes and schedules.
 * Strictly adheres to real-life context rules (e.g. dog walking = routine/discipline, NOT high endurance).
 */
export function parseQuestFromNaturalLanguage(input: string): ParsedQuestResult {
  const text = input.trim();
  const lower = text.toLowerCase();
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // 1. Duration extraction (e.g. "30 mins", "1 hour", "45m", "1.5 hours", "20 minutes")
  let durationMinutes = 30; // default
  const hourMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/);
  const minMatch = lower.match(/(\d+)\s*(?:minutes?|mins?|m)\b/);

  if (hourMatch) {
    durationMinutes = Math.round(parseFloat(hourMatch[1]) * 60);
  } else if (minMatch) {
    durationMinutes = parseInt(minMatch[1], 10);
  }

  // 2. Date & Deadline Parsing
  let startDate = todayStr;
  let deadline: string | null = null;
  let isOneOff = false;

  // Extract explicit time if present (e.g., "at 5pm", "at 14:30")
  let timeStr = "18:00";
  const timeMatch = lower.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? timeMatch[2] : "00";
    const ampm = timeMatch[3];
    if (ampm === "pm" && hour < 12) hour += 12;
    if (ampm === "am" && hour === 12) hour = 0;
    timeStr = `${String(hour).padStart(2, "0")}:${minute}`;
  }

  if (lower.includes("tomorrow")) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowIso = tomorrow.toISOString().split("T")[0];
    startDate = tomorrowIso;
    deadline = `${tomorrowIso}T${timeStr}:00`;
    isOneOff = true;
  } else if (lower.includes("today") || lower.includes("tonight")) {
    deadline = `${todayStr}T${timeStr}:00`;
    isOneOff = true;
  } else {
    // Check day of month: e.g. "on the 25th", "on nov 20"
    const dayOfMonthMatch = lower.match(/on\s+(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?\b/);
    if (dayOfMonthMatch) {
      const targetDay = parseInt(dayOfMonthMatch[1], 10);
      const targetDate = new Date();
      if (targetDate.getDate() > targetDay) {
        targetDate.setMonth(targetDate.getMonth() + 1);
      }
      targetDate.setDate(targetDay);
      const targetIso = targetDate.toISOString().split("T")[0];
      startDate = targetIso;
      deadline = `${targetIso}T${timeStr}:00`;
      isOneOff = true;
    }
  }

  // 3. Recurrence & Days Extraction
  let recurrence: "none" | "daily" | "weekly" | "weekdays" | "custom" = isOneOff ? "none" : "daily";
  let recurrence_days: number[] = [];

  if (lower.includes("every sunday")) {
    recurrence = "weekly";
    recurrence_days = [0];
  } else if (lower.includes("every monday")) {
    recurrence = "weekly";
    recurrence_days = [1];
  } else if (lower.includes("every tuesday")) {
    recurrence = "weekly";
    recurrence_days = [2];
  } else if (lower.includes("every wednesday")) {
    recurrence = "weekly";
    recurrence_days = [3];
  } else if (lower.includes("every thursday")) {
    recurrence = "weekly";
    recurrence_days = [4];
  } else if (lower.includes("every friday")) {
    recurrence = "weekly";
    recurrence_days = [5];
  } else if (lower.includes("every saturday")) {
    recurrence = "weekly";
    recurrence_days = [6];
  } else if (lower.includes("weekdays") || lower.includes("mon-fri") || lower.includes("workdays")) {
    recurrence = "weekdays";
    recurrence_days = [1, 2, 3, 4, 5];
  } else if (lower.includes("every day") || lower.includes("daily")) {
    recurrence = "daily";
    recurrence_days = [0, 1, 2, 3, 4, 5, 6];
  } else if (isOneOff) {
    recurrence = "none";
    recurrence_days = [];
  }

  // 4. Category & Attribute Mapping (Master Spec Section 4)
  let category: QuestCategory = "routine";
  let relevantAttributes: AttributeType[] = ["discipline"];
  let classification: QuestClassification = recurrence === "none" ? "scheduled" : "permanent";

  if (
    lower.includes("dog") ||
    lower.includes("pet") ||
    lower.includes("walk the dog") ||
    lower.includes("walk my dog")
  ) {
    category = "routine";
    classification = "scheduled";
    relevantAttributes = ["discipline", "mentality"];
  } else if (
    lower.includes("code") ||
    lower.includes("program") ||
    lower.includes("software") ||
    lower.includes("next.js") ||
    lower.includes("react") ||
    lower.includes("bug") ||
    lower.includes("api") ||
    lower.includes("developer") ||
    lower.includes("architect")
  ) {
    category = "career";
    relevantAttributes = ["intelligence", "discipline"];
  } else if (
    lower.includes("study") ||
    lower.includes("read") ||
    lower.includes("book") ||
    lower.includes("exam") ||
    lower.includes("math") ||
    lower.includes("learn") ||
    lower.includes("course")
  ) {
    category = "education";
    relevantAttributes = ["intelligence", "mentality"];
  } else if (
    lower.includes("run") ||
    lower.includes("sprint") ||
    lower.includes("jog")
  ) {
    category = "fitness";
    relevantAttributes = ["endurance", "agility"];
  } else if (
    lower.includes("gym") ||
    lower.includes("workout") ||
    lower.includes("bench") ||
    lower.includes("dumbbell") ||
    lower.includes("lift")
  ) {
    category = "fitness";
    relevantAttributes = ["strength", "vitality"];
  } else if (
    lower.includes("party") ||
    lower.includes("friend") ||
    lower.includes("dinner with") ||
    lower.includes("hangout") ||
    lower.includes("meetup")
  ) {
    category = "social";
    classification = "temporary";
    relevantAttributes = ["mentality"];
  } else if (
    lower.includes("clean") ||
    lower.includes("grocery") ||
    lower.includes("groceries") ||
    lower.includes("laundry") ||
    lower.includes("bill") ||
    lower.includes("pay")
  ) {
    category = "household";
    classification = "temporary";
    relevantAttributes = ["discipline"];
  }

  // 5. Priority and Difficulty Estimation
  let priority: "low" | "medium" | "high" | "urgent" = "medium";
  if (lower.includes("urgent") || lower.includes("asap") || lower.includes("immediately")) {
    priority = "urgent";
  } else if (lower.includes("important") || lower.includes("critical") || lower.includes("deadline")) {
    priority = "high";
  }

  let difficulty: HunterRank = "Recruit";
  if (durationMinutes >= 120 || lower.includes("spartan") || lower.includes("hardcore")) {
    difficulty = "Spartan";
  } else if (durationMinutes >= 60 || lower.includes("advanced") || lower.includes("complex")) {
    difficulty = "Warrior";
  }

  // 6. Transparent Mathematical RPG Rewards
  const xpReward = calculateFairQuestXp(durationMinutes, difficulty, priority);
  const attributeRewards = calculateFairStatYield(durationMinutes, difficulty, relevantAttributes);

  // Clean Title Construction
  let title = text;
  title = title.replace(/\b(every\s+(?:day|sunday|monday|tuesday|wednesday|thursday|friday|saturday))\b/gi, "");
  title = title.replace(/\b(for\s+\d+\s*(?:hours?|hrs?|minutes?|mins?))\b/gi, "");
  title = title.replace(/\b(at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/gi, "");
  title = title.trim();
  if (title.length < 3) title = text;
  title = title.charAt(0).toUpperCase() + title.slice(1);

  return {
    title,
    description: `System auto-interpreted from prompt: "${input}"`,
    category,
    classification,
    startDate,
    deadline,
    recurrence,
    recurrence_days,
    durationMinutes,
    priority,
    difficulty,
    relevantAttributes,
    attributeRewards,
    xpReward,
  };
}
