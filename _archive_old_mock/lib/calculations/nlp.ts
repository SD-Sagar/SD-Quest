import { AttributeType, HunterRank, QuestCategory, QuestClassification, QuestRecurrence } from "@/types";
import { calculateFairQuestXp, calculateFairStatYield } from "./rpg";

export interface ParsedQuestResult {
  title: string;
  description: string;
  category: QuestCategory;
  classification: QuestClassification;
  recurrence: QuestRecurrence;
  scheduledDays?: number[];
  durationMinutes: number;
  priority: "low" | "medium" | "high" | "urgent";
  difficulty: HunterRank;
  relevantAttributes: AttributeType[];
  attributeRewards: Record<AttributeType, number>;
  xpReward: number;
}

/**
 * Parses free-form natural language text into a structured quest with fair attributes and schedules.
 */
export function parseQuestFromNaturalLanguage(input: string): ParsedQuestResult {
  const text = input.trim();
  const lower = text.toLowerCase();

  // 1. Duration extraction (e.g. "30 mins", "1 hour", "45m", "1.5 hours", "20 minutes")
  let durationMinutes = 30; // default
  const hourMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/);
  const minMatch = lower.match(/(\d+)\s*(?:minutes?|mins?|m)\b/);

  if (hourMatch) {
    durationMinutes = Math.round(parseFloat(hourMatch[1]) * 60);
  } else if (minMatch) {
    durationMinutes = parseInt(minMatch[1], 10);
  }

  // 2. Recurrence extraction
  let recurrence: QuestRecurrence = "daily";
  let scheduledDays: number[] | undefined = undefined;

  if (lower.includes("every sunday") || lower.includes("on sunday")) {
    recurrence = "weekly";
    scheduledDays = [0];
  } else if (lower.includes("every monday") || lower.includes("on monday")) {
    recurrence = "weekly";
    scheduledDays = [1];
  } else if (lower.includes("weekdays") || lower.includes("mon-fri") || lower.includes("workdays")) {
    recurrence = "weekdays";
    scheduledDays = [1, 2, 3, 4, 5];
  } else if (lower.includes("weekly") || lower.includes("once a week")) {
    recurrence = "weekly";
  } else if (lower.includes("once") || lower.includes("today only") || lower.includes("one-off")) {
    recurrence = "none";
  } else if (lower.includes("daily") || lower.includes("every day") || lower.includes("every morning") || lower.includes("every night")) {
    recurrence = "daily";
  }

  // 3. Category & Attribute Mapping (Strict Real-Life Context Rules)
  let category: QuestCategory = "routine";
  let relevantAttributes: AttributeType[] = ["discipline"];
  let classification: QuestClassification = recurrence === "none" ? "temporary" : "scheduled";

  if (
    lower.includes("dog") ||
    lower.includes("pet") ||
    lower.includes("walk the dog") ||
    lower.includes("walk my dog")
  ) {
    // Dog walking rule: Responsibility & Routine quest, builds Discipline & Mentality, not fake endurance
    category = "routine";
    relevantAttributes = ["discipline", "mentality"];
  } else if (
    lower.includes("code") ||
    lower.includes("program") ||
    lower.includes("software") ||
    lower.includes("next.js") ||
    lower.includes("react") ||
    lower.includes("bug") ||
    lower.includes("api") ||
    lower.includes("developer")
  ) {
    category = "career";
    relevantAttributes = ["intelligence", "discipline"];
  } else if (
    lower.includes("study") ||
    lower.includes("read") ||
    lower.includes("book") ||
    lower.includes("course") ||
    lower.includes("learn") ||
    lower.includes("exam")
  ) {
    category = "education";
    relevantAttributes = ["intelligence", "mentality"];
  } else if (
    lower.includes("run") ||
    lower.includes("jog") ||
    lower.includes("sprint")
  ) {
    category = "fitness";
    relevantAttributes = ["endurance", "agility"];
  } else if (
    lower.includes("gym") ||
    lower.includes("workout") ||
    lower.includes("lift") ||
    lower.includes("dumbbell") ||
    lower.includes("bench")
  ) {
    category = "fitness";
    relevantAttributes = ["strength", "discipline"];
  } else if (
    lower.includes("clean") ||
    lower.includes("groceries") ||
    lower.includes("cook") ||
    lower.includes("chores") ||
    lower.includes("laundry") ||
    lower.includes("wash")
  ) {
    category = "household";
    relevantAttributes = ["discipline", "vitality"];
  } else if (
    lower.includes("party") ||
    lower.includes("friend") ||
    lower.includes("family") ||
    lower.includes("movie") ||
    lower.includes("relax")
  ) {
    category = "social";
    relevantAttributes = ["mentality"];
  }

  // 4. Clean Title Generation
  let cleanTitle = text
    .replace(/\b(?:every\s+\w+|daily|weekly|for\s+\d+\s*(?:mins?|hours?)|weekdays)\b/gi, "")
    .trim();

  // Capitalize title
  cleanTitle = cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : text;

  // 5. Fair Rewards Computation
  const difficulty: HunterRank = "Recruit";
  const priority = lower.includes("urgent") || lower.includes("important") ? "high" : "medium";
  const attributeRewards = calculateFairStatYield(durationMinutes, difficulty, relevantAttributes);
  const xpReward = calculateFairQuestXp(durationMinutes, difficulty, priority);

  return {
    title: cleanTitle,
    description: `Auto-interpreted from: "${text}"`,
    category,
    classification,
    recurrence,
    scheduledDays,
    durationMinutes,
    priority,
    difficulty,
    relevantAttributes,
    attributeRewards,
    xpReward,
  };
}

