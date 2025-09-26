import React, { useState, useEffect } from "react";
import { Brain, Lightbulb, Target, GitBranch, CheckCircle } from "lucide-react";
import groqService from "../services/groqService";

const IdeaMap = ({ problem }) => {
  const [ideaMap, setIdeaMap] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (problem) {
      generateIdeaMap();
    }
  }, [problem]);

  const generateIdeaMap = async () => {
    setIsLoading(true);
    try {
      const response = await groqService.generateIdeaMap(problem);
      setIdeaMap(response);
    } catch (error) {
      console.error("Error generating idea map:", error);
      setIdeaMap("Error generating idea map. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const parseIdeaMap = (content) => {
    // Simple parsing to extract structured information
    const sections = content.split(/\n(?=\d+\.|\*\*|##)/);
    return sections.map((section, index) => ({
      id: index,
      content: section.trim(),
      type: section.includes("**") ? "highlight" : "normal",
    }));
  };

  if (isLoading) {
    return (
      <div className="idea-map-container">
        <div className="idea-map-header">
          <Brain size={24} />
          <h2>Generating Idea Map...</h2>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!ideaMap) {
    return (
      <div className="idea-map-container">
        <div className="idea-map-header">
          <Brain size={24} />
          <h2>Idea Map</h2>
        </div>
        <div className="empty-state">
          <Lightbulb size={48} />
          <p>
            No problem selected. Start a conversation to generate an idea map!
          </p>
        </div>
      </div>
    );
  }

  const ideaMapSections = parseIdeaMap(ideaMap);

  return (
    <div className="idea-map-container">
      <div className="idea-map-header">
        <Brain size={24} />
        <h2>Problem Solving Idea Map</h2>
        <button onClick={generateIdeaMap} className="refresh-button">
          Refresh
        </button>
      </div>

      <div className="idea-map-content">
        <div className="idea-map-visual">
          <div className="central-node">
            <Target size={20} />
            <span>Problem Analysis</span>
          </div>

          <div className="idea-branches">
            <div className="branch">
              <div className="branch-node">
                <Lightbulb size={16} />
                <span>Key Insights</span>
              </div>
            </div>

            <div className="branch">
              <div className="branch-node">
                <GitBranch size={16} />
                <span>Algorithm Approach</span>
              </div>
            </div>

            <div className="branch">
              <div className="branch-node">
                <CheckCircle size={16} />
                <span>Edge Cases</span>
              </div>
            </div>
          </div>
        </div>

        <div className="idea-map-details">
          {ideaMapSections.map((section, index) => (
            <div key={index} className={`idea-section ${section.type}`}>
              <div className="section-content">{section.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IdeaMap;
