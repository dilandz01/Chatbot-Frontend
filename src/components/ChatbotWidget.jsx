import { useRef, useState, useEffect } from "react";
import { Loader, MessageSquareMore, X, MoveUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Enables links & tables
import rehypeRaw from "rehype-raw"; // Allows raw HTML
import useMessageHistory from "../hooks/useMessageHistory";
import useGenerateMessage from "../hooks/useGenerateMessage";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPredefinedQuestions, setShowPredefinedQuestions] = useState(true);

  const [input, setInput] = useState("");
  const scrollableContainerRef = useRef(null);

  //Custom hooks
  const { threadId, setThreadId, messages, setMessages } = useMessageHistory(
    setShowPredefinedQuestions
  );
  const { sendMessage, isLoading } = useGenerateMessage(
    threadId,
    setMessages,
    setThreadId,
    setInput,
    setShowPredefinedQuestions
  );

  //Predefined Questions
  const predefinedQuestions = [
    "How do I find my prescription?",
    "What are the store locations?",
    "What is your warranty policy?",
    "When will I receive my order?",
    "What frames suit oval face shape?",
  ];

  // Scroll to top of the last messages when updated
  useEffect(() => {
    if (scrollableContainerRef.current) {
      const container = scrollableContainerRef.current;
      const lastMessage = container.lastElementChild; // Get the last message

      if (lastMessage) {
        container.scrollTop = lastMessage.offsetTop; // Scroll to the top of the last message
      }
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen((prev) => {
      const newState = !prev;

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
    sendMessage(question);
  };

  return (
    <div>
      {!isOpen ? (
        <button onClick={toggleChat} className="chatbot-button">
          <MessageSquareMore size={35} />
        </button>
      ) : (
        <div className="chatbot-container">
          {/* Chatbot Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-logo">
              {/* Magento link for the image */}
              <img
                src="media/wysiwyg/chatbot/OW-Logo-Long.png"
                alt="Assistant Logo"
              />
            </div>
            <button className="chatbot-close-btn" onClick={toggleChat}>
              <X size={20} />
            </button>
          </div>

          {/* Chatbot Messages */}
          <div className="chatbot-messages" ref={scrollableContainerRef}>
            <div className="chatbot-greeting">
              <span className="chatbot-hello">Hello 👋</span>
              <span className="chatbot-help">How can we help?</span>
            </div>

            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.sender}`}>
                {msg.sender === "bot" && (
                  <div className="chatbot-message-header">
                    <img
                      src="media/wysiwyg/chatbot/Chatbot_OW_Logo.jpg"
                      alt="OW Logo"
                      className="chatbot-message-logo"
                    />
                    <span className="chatbot-message-title">
                      Oscar Wylee Bot
                    </span>
                  </div>
                )}

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
            {isLoading && (
              <div className="typing-indicator">
                <Loader className="loader" />
                Typing...
              </div>
            )}

            {/* Predefined Questions */}
            {showPredefinedQuestions && (
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
              placeholder="Send us a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              className="chatbot-input"
            />
            <button
              onClick={() => sendMessage(input)}
              className="chatbot-send-button"
            >
              <MoveUp className="send-icon" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
