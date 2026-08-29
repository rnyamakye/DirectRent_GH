"use client";

import { useState } from "react";
import { ConversationList } from "./conversation-list";
import { ChatWindow } from "./chat-window";
import { twMerge } from "tailwind-merge";

interface MessagingAppProps {
  currentUserId: string;
  initialConversationId?: string;
  className?: string;
}

export function MessagingApp({ currentUserId, initialConversationId, className }: MessagingAppProps) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId || null);

  // If a conversation is selected on mobile, we hide the list and show the chat.
  // We use CSS classes to manage this responsiveness.

  return (
    <div className={twMerge("flex h-[100dvh] w-full bg-card overflow-hidden shadow-sm", className)}>
      {/* Left Pane: Conversation List */}
      <div 
        className={twMerge(
          "flex-shrink-0 w-full md:w-80 lg:w-96 border-r border-border bg-slate-50/50 flex flex-col transition-all duration-300",
          activeConversationId ? "hidden md:flex" : "flex"
        )}
      >
        <ConversationList 
          currentUserId={currentUserId} 
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => setActiveConversationId(id)} 
        />
      </div>

      {/* Right Pane: Chat Window */}
      <div 
        className={twMerge(
          "flex-1 flex flex-col bg-white transition-all duration-300",
          !activeConversationId ? "hidden md:flex" : "flex"
        )}
      >
        {activeConversationId ? (
          <ChatWindow 
            currentUserId={currentUserId} 
            conversationId={activeConversationId} 
            onBack={() => setActiveConversationId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/20">
            <div className="w-20 h-20 bg-mint text-primary rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-heading">Your Messages</h3>
            <p className="text-body mt-2 max-w-sm">
              Select a conversation from the list to start messaging. You can chat with agents and artisans about properties and services.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
