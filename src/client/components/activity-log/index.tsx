import React from "react";
import { useLingui } from "@lingui/react";
import { i18n } from "../../i18n";
import { Input } from "@/components/ui/input";
import { useActivityLog } from "../../hooks/use-activity-log";
import { ConversationList } from "./conversation-list";
import { MessageList } from "./message-list";

export default function ActivityLog() {
  useLingui();
  const {
    conversations,
    selectedConversation,
    fetchMessages,
    selectConversation,
    loading,
    error,
    filter,
    setFilter,
    filteredMessages,
    formatDate,
    handleExport,
  } = useActivityLog();

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <ConversationList
        conversations={conversations}
        selectedConversation={selectedConversation ?? undefined}
        loading={loading}
        error={error ?? undefined}
        onSelectConversation={(conv) => selectConversation(conv)}
        onExport={handleExport}
        fetchMessages={fetchMessages}
        formatDate={formatDate}
      />

      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {selectedConversation?.title ||
              i18n._("activityLog.selectConversation", {
                message: "Select a conversation",
              })}
          </h2>
          <Input
            placeholder={i18n._("activityLog.filterMessages", {
              message: "Filter messages...",
            })}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <MessageList
          messages={filteredMessages}
          loading={loading}
          error={error ?? undefined}
          selectedConversationTitle={selectedConversation?.title}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
}
