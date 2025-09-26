import React, { useState, useEffect } from "react";
import { Zap, Clock, Database, TrendingUp, AlertCircle } from "lucide-react";
import groqService from "../services/groqService";

const ComplexityAnalysis = ({ problem }) => {
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python");

  useEffect(() => {
    if (problem) {
      generateAnalysis();
    }
  }, [problem, selectedLanguage]);

  const generateAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await groqService.analyzeComplexity(
        problem,
        selectedLanguage
      );
      setAnalysis(response);
    } catch (error) {
      console.error("Error generating complexity analysis:", error);
      setAnalysis("Error generating complexity analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const parseComplexityInfo = (content) => {
    // Enhanced regex patterns to catch more variations
    const timeComplexityPatterns = [
      /Time Complexity[:\s]*(O\([^)]+\))/i,
      /Time[:\s]*(O\([^)]+\))/i,
      /Time[:\s]*O\([^)]+\)/i,
      /O\([^)]+\)/i,
    ];

    const spaceComplexityPatterns = [
      /Space Complexity[:\s]*(O\([^)]+\))/i,
      /Space[:\s]*(O\([^)]+\))/i,
      /Space[:\s]*O\([^)]+\)/i,
    ];

    let timeComplexity = "Not specified";
    let spaceComplexity = "Not specified";

    // Try to find time complexity
    for (const pattern of timeComplexityPatterns) {
      const match = content.match(pattern);
      if (match) {
        timeComplexity = match[1] || match[0];
        break;
      }
    }

    // Try to find space complexity
    for (const pattern of spaceComplexityPatterns) {
      const match = content.match(pattern);
      if (match) {
        spaceComplexity = match[1] || match[0];
        break;
      }
    }

    // If still not found, try to extract from the full content
    if (
      timeComplexity === "Not specified" ||
      spaceComplexity === "Not specified"
    ) {
      const lines = content.split("\n");
      for (const line of lines) {
        if (line.toLowerCase().includes("time") && line.includes("O(")) {
          const match = line.match(/O\([^)]+\)/);
          if (match) timeComplexity = match[0];
        }
        if (line.toLowerCase().includes("space") && line.includes("O(")) {
          const match = line.match(/O\([^)]+\)/);
          if (match) spaceComplexity = match[0];
        }
      }
    }

    return {
      timeComplexity,
      spaceComplexity,
      fullAnalysis: content,
    };
  };

  const getComplexityColor = (complexity) => {
    if (complexity.includes("O(1)")) return "#4CAF50";
    if (complexity.includes("O(log n)")) return "#8BC34A";
    if (complexity.includes("O(n)")) return "#FFC107";
    if (complexity.includes("O(n log n)")) return "#FF9800";
    if (complexity.includes("O(n²)") || complexity.includes("O(n^2)"))
      return "#F44336";
    return "#9E9E9E";
  };

  if (isLoading) {
    return (
      <div className="complexity-container">
        <div className="complexity-header">
          <Zap size={24} />
          <h2>Analyzing Complexity...</h2>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="complexity-container">
        <div className="complexity-header">
          <Zap size={24} />
          <h2>Complexity Analysis</h2>
        </div>
        <div className="empty-state">
          <Zap size={48} />
          <p>
            No problem selected. Start a conversation to analyze complexity!
          </p>
        </div>
      </div>
    );
  }

  const complexityInfo = parseComplexityInfo(analysis);

  return (
    <div className="complexity-container">
      <div className="complexity-header">
        <Zap size={24} />
        <h2>Complexity Analysis</h2>
        <div className="language-selector">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>
        <button onClick={generateAnalysis} className="refresh-button">
          Re-analyze
        </button>
      </div>

      <div className="complexity-content">
        <div className="complexity-overview">
          <div className="complexity-card time-complexity">
            <div className="complexity-icon">
              <Clock size={24} />
            </div>
            <div className="complexity-info">
              <h3>Time Complexity</h3>
              <div
                className="complexity-value"
                style={{
                  color: getComplexityColor(complexityInfo.timeComplexity),
                }}
              >
                {complexityInfo.timeComplexity}
              </div>
            </div>
          </div>

          <div className="complexity-card space-complexity">
            <div className="complexity-icon">
              <Database size={24} />
            </div>
            <div className="complexity-info">
              <h3>Space Complexity</h3>
              <div
                className="complexity-value"
                style={{
                  color: getComplexityColor(complexityInfo.spaceComplexity),
                }}
              >
                {complexityInfo.spaceComplexity}
              </div>
            </div>
          </div>
        </div>

        <div className="complexity-details">
          <div className="complexity-explanation">
            <h3>Detailed Analysis</h3>
            <div className="analysis-content">
              <pre>{complexityInfo.fullAnalysis}</pre>
            </div>
          </div>

          <div className="optimization-tips">
            <h3>Optimization Tips</h3>
            <div className="tips-list">
              <div className="tip">
                <TrendingUp size={16} />
                <span>Consider using more efficient data structures</span>
              </div>
              <div className="tip">
                <AlertCircle size={16} />
                <span>Look for opportunities to reduce nested loops</span>
              </div>
              <div className="tip">
                <Zap size={16} />
                <span>Use memoization for repeated calculations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplexityAnalysis;
