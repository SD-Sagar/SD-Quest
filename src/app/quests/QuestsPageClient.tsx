"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuestList } from "@/components/quests/QuestList";
import { SmartQuestModal } from "@/components/quests/SmartQuestModal";
import { ManualQuestModal } from "@/components/quests/ManualQuestModal";
import { Quest } from "@/types";

interface QuestsPageClientProps {
  initialQuests: Quest[];
  mainQuestSplit?: {
    dayName: string;
    title: string;
    subtitle: string;
    isRest?: boolean;
    isCompleted: boolean;
    sessionData?: any;
  };
}

export function QuestsPageClient({ initialQuests, mainQuestSplit }: QuestsPageClientProps) {
  const router = useRouter();
  const [isSmartModalOpen, setIsSmartModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  return (
    <>
      <QuestList
        quests={initialQuests}
        onOpenManualModal={() => setIsManualModalOpen(true)}
        onOpenSmartModal={() => setIsSmartModalOpen(true)}
        hideCreationButtons={false}
        mainQuestSplit={
          mainQuestSplit
            ? {
                ...mainQuestSplit,
                onEnterGym: () => router.push(`/gym?split=${mainQuestSplit.dayName}`),
              }
            : undefined
        }
      />

      <SmartQuestModal
        isOpen={isSmartModalOpen}
        onClose={() => setIsSmartModalOpen(false)}
      />
      <ManualQuestModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </>
  );
}

