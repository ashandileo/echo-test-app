"use client";
import { MessageSquare } from "lucide-react";
import { useToggle } from "usehooks-ts";

import AssistantChatSheet from "@/components/sheets/AssistantChatSheet";
import { Button } from "@/components/ui/button";

const AssistantChat = () => {
  const [isChatOpen, toggleChatOpen] = useToggle(false);

  return (
    <>
      <Button onClick={toggleChatOpen} className="gap-2" variant="outline">
        <MessageSquare className="size-4" />
        Open AI Assistant
      </Button>

      <AssistantChatSheet open={isChatOpen} toggleOpen={toggleChatOpen} />
    </>
  );
};

export default AssistantChat;
