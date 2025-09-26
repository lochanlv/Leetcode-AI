import Groq from "groq-sdk";

class GroqService {
  constructor() {
    this.groq = new Groq({
      apiKey: import.meta.env.VITE_GROQ_API_KEY || "your-groq-api-key-here",
      dangerouslyAllowBrowser: true,
    });
  }

  async generateResponse(prompt, systemPrompt = "") {
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt || this.getDefaultSystemPrompt(),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 1,
        stream: false,
        stop: null,
      });

      return completion.choices[0]?.message?.content || "No response generated";
    } catch (error) {
      console.error("Groq API Error:", error);
      throw new Error(
        "Failed to generate response. Please check your API key and try again."
      );
    }
  }

  getDefaultSystemPrompt() {
    return `You are an expert LeetCode problem-solving AI assistant. Your role is to:

1. Help users understand and solve LeetCode problems
2. Generate code solutions in multiple programming languages (Python, JavaScript, Java, C++)
3. Provide detailed time and space complexity analysis
4. Create comprehensive test cases
5. Generate idea maps and problem-solving strategies
6. Explain algorithms and data structures used

Always structure your responses with clear sections and provide practical, working code examples.`;
  }

  async solveLeetCodeProblem(problemDescription, language = "python") {
    const prompt = `Please solve this LeetCode problem: ${problemDescription}

Requirements:
1. Provide a step-by-step approach
2. Generate complete working code in ${language}
3. Explain time and space complexity with Big O notation (e.g., Time Complexity: O(n), Space Complexity: O(1))
4. Provide test cases with input and expected output
5. Create an idea map for the solution approach
6. Include edge cases and optimization strategies

Format your response with clear sections and make sure to explicitly state the time and space complexity.`;

    return await this.generateResponse(prompt);
  }

  async generateIdeaMap(problemDescription) {
    const prompt = `Create a detailed idea map for solving this LeetCode problem: ${problemDescription}

The idea map should include:
1. Problem analysis
2. Key insights
3. Algorithm approach
4. Data structures needed
5. Edge cases to consider
6. Optimization strategies

Present this as a structured mind map with clear connections.`;

    return await this.generateResponse(prompt);
  }

  async generateCodeInLanguage(problemDescription, language) {
    const prompt = `Generate a complete solution for this LeetCode problem in ${language}: ${problemDescription}

Include:
1. Complete working code
2. Comments explaining the logic
3. Time and space complexity analysis
4. Test cases with expected outputs
5. Edge case handling

Make sure the code is production-ready and well-documented.`;

    return await this.generateResponse(prompt);
  }

  async analyzeComplexity(code, language) {
    const prompt = `Analyze the time and space complexity of this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Please provide a detailed analysis including:
1. Time Complexity: O(...) - with clear explanation
2. Space Complexity: O(...) - with clear explanation
3. Line-by-line analysis of the most complex parts
4. Explanation of why these complexities occur
5. Suggestions for optimization if possible
6. Alternative approaches with different complexity trade-offs

Make sure to explicitly state "Time Complexity: O(...)" and "Space Complexity: O(...)" in your response.`;

    return await this.generateResponse(prompt);
  }

  async generateTestCases(problemDescription) {
    const prompt = `Generate comprehensive test cases for this LeetCode problem: ${problemDescription}

Include:
1. Basic test cases
2. Edge cases
3. Large input test cases
4. Expected outputs for each test case
5. Explanation of what each test case validates

Format the test cases in a clear, structured way.`;

    return await this.generateResponse(prompt);
  }
}

export default new GroqService();
