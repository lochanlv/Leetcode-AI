import React, { useState, useEffect } from "react";
import {
  TestTube,
  Play,
  CheckCircle,
  XCircle,
  Copy,
  Check,
} from "lucide-react";
import groqService from "../services/groqService";
import { copyToClipboard } from "../utils/copyToClipboard";

const TestCases = ({ problem }) => {
  const [testCases, setTestCases] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    if (problem) {
      generateTestCases();
    }
  }, [problem]);

  const generateTestCases = async () => {
    setIsLoading(true);
    try {
      const response = await groqService.generateTestCases(problem);
      setTestCases(response);
    } catch (error) {
      console.error("Error generating test cases:", error);
      setTestCases("Error generating test cases. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async (text, index) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const parseTestCases = (content) => {
    // Parse test cases from the response
    const lines = content.split("\n");
    const cases = [];
    let currentCase = null;

    lines.forEach((line, index) => {
      if (line.match(/^\d+\./)) {
        if (currentCase) cases.push(currentCase);
        currentCase = {
          id: cases.length + 1,
          description: line,
          input: "",
          expected: "",
          explanation: "",
        };
      } else if (currentCase && line.includes("Input:")) {
        currentCase.input = line.replace("Input:", "").trim();
      } else if (currentCase && line.includes("Expected:")) {
        currentCase.expected = line.replace("Expected:", "").trim();
      } else if (currentCase && line.includes("Explanation:")) {
        currentCase.explanation = line.replace("Explanation:", "").trim();
      }
    });

    if (currentCase) cases.push(currentCase);
    return cases;
  };

  if (isLoading) {
    return (
      <div className="test-cases-container">
        <div className="test-cases-header">
          <TestTube size={24} />
          <h2>Generating Test Cases...</h2>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!testCases) {
    return (
      <div className="test-cases-container">
        <div className="test-cases-header">
          <TestTube size={24} />
          <h2>Test Cases</h2>
        </div>
        <div className="empty-state">
          <TestTube size={48} />
          <p>
            No problem selected. Start a conversation to generate test cases!
          </p>
        </div>
      </div>
    );
  }

  const parsedCases = parseTestCases(testCases);

  return (
    <div className="test-cases-container">
      <div className="test-cases-header">
        <TestTube size={24} />
        <h2>Test Cases</h2>
        <button onClick={generateTestCases} className="refresh-button">
          Generate New
        </button>
      </div>

      <div className="test-cases-content">
        {parsedCases.length > 0 ? (
          <div className="test-cases-list">
            {parsedCases.map((testCase, index) => (
              <div key={index} className="test-case">
                <div className="test-case-header">
                  <h3>Test Case {testCase.id}</h3>
                  <div className="test-case-actions">
                    <button
                      className="run-button"
                      onClick={() =>
                        console.log("Running test case", testCase.id)
                      }
                    >
                      <Play size={16} />
                      Run
                    </button>
                    <button
                      className="copy-button"
                      onClick={() =>
                        handleCopyToClipboard(testCase.input, index)
                      }
                    >
                      {copiedIndex === index ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                      {copiedIndex === index ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="test-case-content">
                  <div className="test-case-description">
                    {testCase.description}
                  </div>

                  <div className="test-case-details">
                    <div className="input-section">
                      <label>Input:</label>
                      <div className="code-block">
                        <pre>{testCase.input}</pre>
                      </div>
                    </div>

                    <div className="expected-section">
                      <label>Expected Output:</label>
                      <div className="code-block expected">
                        <pre>{testCase.expected}</pre>
                      </div>
                    </div>

                    {testCase.explanation && (
                      <div className="explanation-section">
                        <label>Explanation:</label>
                        <p>{testCase.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="test-cases-raw">
            <pre>{testCases}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCases;
