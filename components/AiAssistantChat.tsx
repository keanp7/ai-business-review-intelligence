import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";
import { useAiChat } from "../helpers/useAiChat";
import { useI18n } from "../helpers/i18n";
import styles from "./AiAssistantChat.module.css";

export const AiAssistantChat = () => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { messages, sendMessage, isLoading } = useAiChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  return (
    <>
      {/* Floating Action Button */}
      <Button
        className={`${styles.fab} ${isOpen ? styles.fabHidden : ""}`}
        onClick={toggleChat}
        size="icon-lg"
        aria-label="Open AI Assistant"
      >
        <Sparkles size={24} />
      </Button>

      {/* Chat Panel */}
      <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Sparkles size={18} className={styles.headerIcon} />
            <span>{t("ai.title")}</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleChat}
            className={styles.closeButton}
          >
            <X size={18} />
          </Button>
        </div>

        <div className={styles.messagesArea}>
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className={`${styles.message} ${styles.messageAi}`}>
              <div className={styles.avatarAi}>
                <Bot size={16} />
              </div>
              <div className={styles.bubbleAi}>
                {t("ai.welcome")}
              </div>
            </div>
          )}

          {/* Conversation History */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                msg.role === "user" ? styles.messageUser : styles.messageAi
              }`}
            >
              {msg.role === "assistant" && (
                <div className={styles.avatarAi}>
                  <Bot size={16} />
                </div>
              )}
              <div
                className={
                  msg.role === "user" ? styles.bubbleUser : styles.bubbleAi
                }
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className={styles.avatarUser}>
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className={`${styles.message} ${styles.messageAi}`}>
              <div className={styles.avatarAi}>
                <Bot size={16} />
              </div>
              <div className={`${styles.bubbleAi} ${styles.thinking}`}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className={styles.inputArea}>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t("ai.placeholder")}
            className={styles.input}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon-md"
            variant="primary"
            disabled={!inputValue.trim() || isLoading}
            className={styles.sendButton}
          >
            <Send size={18} />
          </Button>
        </form>
      </div>
    </>
  );
};