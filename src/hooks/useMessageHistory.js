import { useState, useEffect } from "react";

export default function useMessageHistory(setShowPredefinedQuestions) {
  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem("chat_messages");
      const parsedMessages = savedMessages ? JSON.parse(savedMessages) : null;

       // If messages exist but expired, clear them
       if (parsedMessages.expiry && parsedMessages.expiry <= now) {
        console.log("Messages expired, clearing...");
        localStorage.removeItem("chat_messages");
        return [{ sender: "bot", text: "Hello! How can I help?" }];
      }

      // Check if the data has the correct structure
      return parsedMessages && parsedMessages.messages
        ? parsedMessages.messages
        : [{ sender: "bot", text: "Hello! How can I help?" }];
    } catch (error) {
      console.error("Error parsing messages from localStorage:", error);
      return [{ sender: "bot", text: "Hello! How can I help?" }];
    }
  });

  const [threadId, setThreadId] = useState(() => {
    // Retrieve stored thread information from localStorage
    const storedThread = JSON.parse(localStorage.getItem("threadIdData"));

    // Check if the stored thread exists and has not expired
    if (storedThread && storedThread.expiry > Date.now()) {
      return storedThread.id; // Return the valid threadId
    } else {
      return null; // Return null if the thread is expired or doesn't exist
    }
  });

  useEffect(() => {
    if (messages.length > 0) {
      if (messages.length === 1 && messages[0].sender === "bot") {
        // If only default bot message exists, show predefined questions
        setShowPredefinedQuestions(true);
      } else {
        setShowPredefinedQuestions(false);
      }

      const expiryTime = Date.now() + 30 * 60 * 1000; // Expire in 30 minutes
      localStorage.setItem(
        "chat_messages",
        JSON.stringify({ messages, expiry: expiryTime })
      );
    }
  }, [messages]);

  useEffect(() => {
    if (threadId) {
      const expiryTime = Date.now() + 30 * 60 * 1000; // Expire in 30 minutes
      localStorage.setItem(
        "threadIdData",
        JSON.stringify({ id: threadId, expiry: expiryTime })
      );
    }
  }, [threadId]);

  // Check and clean expired data on mount
  useEffect(() => {
    const storedThread = JSON.parse(localStorage.getItem("threadIdData"));
    const storedMessages = JSON.parse(localStorage.getItem("chat_messages"));

    const now = Date.now();

    if (storedThread && storedThread.expiry <= now) {
      localStorage.removeItem("threadIdData");
      setThreadId(null);
    }

    if (storedMessages && storedMessages.expiry <= now) {
      localStorage.removeItem("chat_messages");
      setMessages([{ sender: "bot", text: "Hello! How can I help?" }]);
      setShowPredefinedQuestions(true);
    }
  }, []);

  return { threadId, setThreadId, messages, setMessages };
}
