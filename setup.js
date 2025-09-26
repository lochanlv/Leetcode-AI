import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, ".env");
const envExamplePath = path.join(__dirname, ".env.example");

if (!fs.existsSync(envPath)) {
  const envContent = `# Groq API Key
# Get your API key from https://console.groq.com/
# Replace 'your-groq-api-key-here' with your actual API key
VITE_GROQ_API_KEY=your-groq-api-key-here
`;

  fs.writeFileSync(envPath, envContent);
  console.log("✅ Created .env file");
} else {
  console.log("✅ .env file already exists");
}

// Create .env.example file
const envExampleContent = `# Groq API Key
# Get your API key from https://console.groq.com/
VITE_GROQ_API_KEY=your-groq-api-key-here
`;

fs.writeFileSync(envExamplePath, envExampleContent);
console.log("✅ Created .env.example file");

console.log("\n🚀 Setup complete!");
console.log("📝 Next steps:");
console.log("1. Get your Groq API key from https://console.groq.com/");
console.log(
  '2. Replace "your-groq-api-key-here" in the .env file with your actual API key'
);
console.log('3. Run "npm run dev" to start the application');
