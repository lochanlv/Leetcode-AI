import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Code,
  Brain,
  TestTube,
  Zap,
  Copy,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import groqService from "../services/groqService";
import IdeaMap from "./IdeaMap";
import TestCases from "./TestCases";
import ComplexityAnalysis from "./ComplexityAnalysis";
import { copyToClipboard } from "../utils/copyToClipboard";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [currentProblem, setCurrentProblem] = useState("");
  const [copiedCodeBlocks, setCopiedCodeBlocks] = useState(new Set());
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentProblem(input);
    setInput("");
    setIsLoading(true);

    try {
      const response = await groqService.solveLeetCodeProblem(input);
      const botMessage = { role: "assistant", content: response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        content: `Error: ${error.message}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyCode = async (code, blockId) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCodeBlocks((prev) => new Set([...prev, blockId]));
      setTimeout(() => {
        setCopiedCodeBlocks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(blockId);
          return newSet;
        });
      }, 2000);
    }
  };

  const generateIdeaMap = async () => {
    if (!currentProblem) return;
    setIsLoading(true);
    try {
      const response = await groqService.generateIdeaMap(currentProblem);
      setActiveTab("idea-map");
    } catch (error) {
      console.error("Error generating idea map:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTestCases = async () => {
    if (!currentProblem) return;
    setIsLoading(true);
    try {
      const response = await groqService.generateTestCases(currentProblem);
      setActiveTab("test-cases");
    } catch (error) {
      console.error("Error generating test cases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message, messageIndex) => {
    if (message.role === "user") {
      return (
        <div className="message user-message">
          <div className="message-avatar">
            <User size={20} />
          </div>
          <div className="message-content">
            <div className="message-text">{message.content}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="message bot-message">
        <div className="message-avatar">
          <Bot size={20} />
        </div>
        <div className="message-content">
          <div className="message-text">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeText = String(children).replace(/\n$/, "");
                  const blockId = `${messageIndex}-${Math.random()
                    .toString(36)
                    .substr(2, 9)}`;
                  const isCopied = copiedCodeBlocks.has(blockId);

                  return !inline && match ? (
                    <div className="code-block-container">
                      <div className="code-block-header">
                        <span className="code-language">
                          {match[1].toUpperCase()}
                        </span>
                        <button
                          className="copy-code-button"
                          onClick={() => handleCopyCode(codeText, blockId)}
                          title="Copy code"
                        >
                          {isCopied ? <Check size={16} /> : <Copy size={16} />}
                          {isCopied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {codeText}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h1>LeetCode AI Assistant</h1>
        <div className="tab-navigation">
          <button
            className={`tab ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            <Bot size={16} /> Chat
          </button>
          <button
            className={`tab ${activeTab === "idea-map" ? "active" : ""}`}
            onClick={generateIdeaMap}
            disabled={!currentProblem}
          >
            <Brain size={16} /> Idea Map
          </button>
          <button
            className={`tab ${activeTab === "test-cases" ? "active" : ""}`}
            onClick={generateTestCases}
            disabled={!currentProblem}
          >
            <TestTube size={16} /> Test Cases
          </button>
          <button
            className={`tab ${activeTab === "complexity" ? "active" : ""}`}
            onClick={() => setActiveTab("complexity")}
            disabled={!currentProblem}
          >
            <Zap size={16} /> Complexity
          </button>
        </div>
      </div>

      <div className="chat-content">
        {activeTab === "chat" && (
          <div className="messages-container">
            {messages.length === 0 && (
              <div className="welcome-message">
                <h2>Welcome to LeetCode AI Assistant!</h2>
                <p>I can help you with:</p>
                <ul>
                  <li>Solving LeetCode problems step by step</li>
                  <li>Generating code in multiple languages</li>
                  <li>Analyzing time and space complexity</li>
                  <li>Creating test cases</li>
                  <li>Building idea maps for problem solving</li>
                </ul>
                <p>
                  Just describe a LeetCode problem and I'll help you solve it!
                </p>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index}>{renderMessage(message, index)}</div>
            ))}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-avatar">
                  <Bot size={20} />
                </div>
                <div className="message-content">
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {activeTab === "idea-map" && <IdeaMap problem={currentProblem} />}

        {activeTab === "test-cases" && <TestCases problem={currentProblem} />}

        {activeTab === "complexity" && (
          <ComplexityAnalysis problem={currentProblem} />
        )}
      </div>

      <div className="chat-input">
        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe a LeetCode problem or ask for help..."
            rows="3"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="send-button"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
