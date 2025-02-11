import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { Loader, MessageCircle, X, SendHorizontal } from "lucide-react";
import Logo from "/ow-logo.jpg";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Enables links & tables
import rehypeRaw from "rehype-raw"; // Allows raw HTML

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPredefindQuestions, setShowPredefinedQuestions] = useState(true);
  const scrollableContainerRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("chat_messages");
    return savedMessages
      ? JSON.parse(savedMessages)
      : [{ sender: "bot", text: "Hello! How can I help?" }];
  });

  //Predefined Questions
  const predefinedQuestions = [
    "How to book an eye test?",
    "What are the store locations?",
    "What are types of eye diseases?",
  ];

  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState(() => {
    const storedThread = JSON.parse(localStorage.getItem("threadIdData"));

    if (storedThread && storedThread.expiry > Date.now()) {
      return storedThread.id; // Return valid threadId
    } else {
      return null; // Expired or not available
    }
  });

  // Scroll to bottom when messages are updated
  useEffect(() => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTop =
        scrollableContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      const storedThread = JSON.parse(localStorage.getItem("threadIdData"));

      if (storedThread && storedThread.expiry <= Date.now()) {
        localStorage.removeItem("threadIdData"); // ✅ Remove expired threadId
        localStorage.removeItem("chat_messages"); // ✅ Remove expired chat messages
        // console.log("Local storage cleared after 2 minutes");
      }
    }, 5000); // ✅ Check every 5 seconds to optimize performance

    return () => clearInterval(interval); // Cleanup when component unmounts
  }, []);

  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (threadId) {
      const expiryTime = Date.now() + 2 * 60 * 1000; //Set expiration to 2 min
      localStorage.setItem(
        "threadIdData",
        JSON.stringify({ id: threadId, expiry: expiryTime })
      );
    }
  }, [threadId]);

  const toggleChat = () => {
    setIsOpen((prev) => {
      const newState = !prev;

      // Send message to Magento Parent Page to update the iframe size
      //window.parent.postMessage({ chatbotOpen: newState }, "*");

      // Scroll to the bottom when the chatbot is opened
      if (!newState) return newState; // If closing, no need to scroll
      setTimeout(() => {
        if (scrollableContainerRef.current) {
          scrollableContainerRef.current.scrollTop =
            scrollableContainerRef.current.scrollHeight;
        }
      }, 0);

      return newState;
    });
  };

  const handleQuestionClick = (question) => {
    setInput(question);
    setShowPredefinedQuestions(false); // Hide quick questions after selection
  };

  const cleanRespone = (response) => {
    return response
      .replace(/【\d+:\d+†source】/g, "") // Remove source references
      .replace(/\n\s+/g, "\n")
      .trim();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setShowPredefinedQuestions(false);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/chat`,
        {
          message: input,
          threadID: threadId,
        }
      );

      const cleanedResponse = cleanRespone(response.data.response);

      const botReply = { sender: "bot", text: cleanedResponse };
      setMessages((prev) => [...prev, botReply]);

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
      setLoading(false);
    }
  };

  return (
    <div>
    {!isOpen ? (
      <button onClick={toggleChat} className="chatbot-button">
        <MessageCircle size={35} />
      </button>
    ) : (
      <div className="chatbot-container">
        {/* Chatbot Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            <img src={Logo} alt="Assistant Logo" />
            <span className="chatbot-title">Oscar Wylee AI Assistant</span>
          </div>
          <button onClick={toggleChat}>
            <X size={20} />
          </button>
        </div>
  
        {/* Chatbot Messages */}
        <div className="chatbot-messages" ref={scrollableContainerRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`chatbot-message ${msg.sender}`}>
              <div className="chatbot-message-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        className="markdown-content"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {props.children}
                      </a>
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}
  
          {/* Typing Indicator */}
          {loading && (
            <div className="typing-indicator">
              <Loader className="animate-spin w-4 h-4" />
              Typing...
            </div>
          )}
  
          {/* Predefined Questions */}
          {showPredefindQuestions && (
            <div className="chatbot-questions">
              {predefinedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question)}
                  className="chatbot-question-button"
                >
                  {question}
                </button>
              ))}
            </div>
          )}
        </div>
  
        {/* Chatbot Input */}
        <div className="chatbot-input-container">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="chatbot-input"
          />
          <button onClick={sendMessage} className="chatbot-send-button">
            <SendHorizontal className="send-icon" />
          </button>
        </div>
      </div>
    )}
  </div>
  
  );
}
