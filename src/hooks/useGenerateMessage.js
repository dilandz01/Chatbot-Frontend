import { useState } from "react";
import axios from "axios";

export default function useGenerateMessage(
  threadId,
  setMessages,
  setThreadId,
  setInput,
  setShowPredefinedQuestions
) {
  const [isLoading, setIsLoading] = useState(false);

  const currentDomain = window.location.hostname;

  // Cleans unneccsary details from assistant ai response
  const cleanRespone = (response) => {
    return response
      .replace(/【\d+:\d+†source】/g, "") // Remove source references
      .replace(/\n\s+/g, "\n") // Remove leading spaces from new lines
      .replace(/\n{2,}/g, "\n") // Reduce multiple newlines to a single one
      .trim();
  };

  // Funcation to request the assistant ai responce based on user input
  const sendMessage = async (input) => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setShowPredefinedQuestions(false);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/chat`,
        {
          message: input,
          threadID: threadId,
          domain: currentDomain,
        }
      );

      const cleanedResponse = cleanRespone(response.data.response);
      const assistantReply = { sender: "bot", text: cleanedResponse };

      setMessages((prev) => [...prev, assistantReply]);

      // Update threadId if a new one is provided
      if (response.data.threadId && response.data.threadId !== threadId) {
        setThreadId(response.data.threadId);
      }
    } catch (error) {
      console.log(error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading };
}
