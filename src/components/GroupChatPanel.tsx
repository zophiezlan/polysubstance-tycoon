import { GameState, GroupChatMessage } from '../game/types';
import { getUnreadCount } from '../game/groupChat';
import { useEffect, useRef, useState } from 'react';
import '../styles/GroupChatPanel.css';

interface GroupChatPanelProps {
  state: GameState;
  onMarkAsRead: () => void;
}

export function GroupChatPanel({ state, onMarkAsRead }: GroupChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const unreadCount = getUnreadCount(state);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isExpanded && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.groupChatMessages.length, isExpanded]);

  // Mark messages as read when panel is expanded
  useEffect(() => {
    if (isExpanded && unreadCount > 0) {
      const timer = setTimeout(() => {
        onMarkAsRead();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, unreadCount, onMarkAsRead]);

  // Feature not unlocked yet
  if (!state.unlockedFeatures.includes('groupChat')) {
    return null;
  }

  // No messages yet
  if (state.groupChatMessages.length === 0) {
    return null;
  }

  // Format timestamp relative to now
  const formatTime = (timestamp: number): string => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className={`group-chat-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="chat-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="chat-title">
          📱 Group Chat
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </span>
        <span className="expand-icon">{isExpanded ? '▼' : '▲'}</span>
      </div>

      {isExpanded && (
        <div className="chat-messages">
          {state.groupChatMessages.map((msg: GroupChatMessage) => (
            <div
              key={msg.id}
              className={`chat-message ${!msg.read ? 'unread' : ''}`}
            >
              <div className="message-header">
                <span className="sender-name">{msg.sender}</span>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="message-text">{msg.message}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {!isExpanded && unreadCount > 0 && (
        <div className="chat-preview">
          {state.groupChatMessages[state.groupChatMessages.length - 1].sender}:{' '}
          {state.groupChatMessages[state.groupChatMessages.length - 1].message.substring(0, 30)}...
        </div>
      )}
    </div>
  );
}
