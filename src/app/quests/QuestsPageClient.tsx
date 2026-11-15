"use client";

import { useState } from "react";
import { QuestList } from "@/components/quests/QuestList";
import { SmartQuestModal } from "@/components/quests/SmartQuestModal";
import { ManualQuestModal } from "@/components/quests/ManualQuestModal";
import { Quest } from "@/types";

export function QuestsPageClient({ initialQuests }: { initialQuests: Quest[] }) {
  const [isSmartModalOpen, setIsSmartModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  return (
    <>
      <QuestList
        quests={initialQuests}
        onOpenManualModal={() => setIsManualModalOpen(true)}
        onOpenSmartModal={() => setIsSmartModalOpen(true)}
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

