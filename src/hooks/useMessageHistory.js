import { useState, useEffect } from "react";

export default function useMessageHistory(setShowPredefinedQuestions) {
  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem("chat_messages");
      const parsedMessages = savedMessages ? JSON.parse(savedMessages) : null;

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
      const expiryTime = Date.now() + 60 * 60 * 1000; // Expire in 60 minutes
      localStorage.setItem(
        "chat_messages",
        JSON.stringify({ messages, expiry: expiryTime })
      );
    }
  }, [messages]);

  useEffect(() => {
    if (threadId) {
      const expiryTime = Date.now() + 60 * 60 * 1000; // Expire in 60 minutes
      localStorage.setItem(
        "threadIdData",
        JSON.stringify({ id: threadId, expiry: expiryTime })
      );

      //Set a timeout to clear both threadId and messages when they expire
      const timeout = setTimeout(() => {
        console.log("data is cleaned");
        localStorage.removeItem("threadIdData");
        localStorage.removeItem("chat_messages");
        setThreadId(null);
        setMessages([{ sender: "bot", text: "Hello! How can I help?" }]);
        setShowPredefinedQuestions(true);
      }, expiryTime - Date.now());

      return () => clearTimeout(timeout); // Cleanup on change
    }
  }, [threadId]);

  // Check and clean expired data on mount
  useEffect(() => {
    const checkAndClearStorage = () => {
      const storedThread = JSON.parse(localStorage.getItem("threadIdData"));
      const storedMessages = JSON.parse(localStorage.getItem("chat_messages"));

      const now = Date.now();

      if (storedThread && storedThread.expiry <= now) {
        localStorage.removeItem("threadIdData");
        setThreadId(null);
      }

      if (storedMessages && storedMessages.expiry <= now) {
        localStorage.removeItem("chat_messages");
        setMessages([]);
      }
    };

    checkAndClearStorage(); // Run once immediately
    const interval = setInterval(checkAndClearStorage, 5000); // Run every 5s

    return () => clearInterval(interval);
  }, []);

  return { threadId, setThreadId, messages, setMessages };
}
