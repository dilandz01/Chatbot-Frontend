import { useRef, useState, useEffect } from "react";
import { Loader, MessageCircle, X, SendHorizontal } from "lucide-react";
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
  const {threadId, setThreadId, messages, setMessages} = useMessageHistory(setShowPredefinedQuestions);
  const { sendMessage, isLoading } = useGenerateMessage(threadId, setMessages, setThreadId, setInput, setShowPredefinedQuestions);

  //Predefined Questions
  const predefinedQuestions = [
    "How to book an eye test?",
    "What are the store locations?",
    "What are types of eye diseases?",
  ];


  // Scroll to bottom when messages are updated
  useEffect(() => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTop =
        scrollableContainerRef.current.scrollHeight;
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
        <MessageCircle size={35} />
      </button>
    ) : (
      <div className="chatbot-container">
        {/* Chatbot Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            {/* Magento link for the image */}
            <img src="media/wysiwyg/homepage/Chatbot_OW_Logo.jpg" alt="Assistant Logo" />
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
          {isLoading && (
            <div className="typing-indicator">
              <Loader className="animate-spin w-4 h-4" />
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
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            className="chatbot-input"
          />
          <button onClick={() => sendMessage(input)} className="chatbot-send-button">
            <SendHorizontal className="send-icon" />
          </button>
        </div>
      </div>
    )}
  </div>
  
  );
}
