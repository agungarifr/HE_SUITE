import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FINDINGS_PATH = path.join(__dirname, "public", "data", "findings.json");
const STORIES_PATH = path.join(__dirname, "public", "data", "user_stories.json");
const KB_PATH = path.join(__dirname, "public", "knowledge_base");

// Initialize directories
async function initDirs() {
  await fs.mkdir(path.dirname(FINDINGS_PATH), { recursive: true }).catch(() => {});
  await fs.mkdir(path.dirname(STORIES_PATH), { recursive: true }).catch(() => {});
}
initDirs();

// Utility for atomic writes to prevent corruption
async function safeWrite(filepath, content) {
  const tmpPath = `${filepath}.${Date.now()}.tmp`;
  await fs.writeFile(tmpPath, content);
  await fs.rename(tmpPath, filepath);
}

const server = new Server(
  { name: "he-suite-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_user_stories",
        description: "Retrieve the list of available user stories/test cases from the HE SUITE database.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "add_he_finding",
        description: "Add a new Heuristic Evaluation finding to the dashboard database.",
        inputSchema: {
          type: "object",
          properties: {
            Severity: { type: "number", description: "Severity 0 to 4" },
            Heuristic_Type: { type: "string", description: "Which of Nielsen's 10 Heuristics this violates" },
            Issue_Title: { type: "string", description: "Short title of the issue" },
            Description: { type: "string", description: "Detailed description of the issue" },
            Recommendation: { type: "string", description: "How to fix the issue" },
            User_Story_Context: { type: "string", description: "The ID or Title of the User Story this relates to (or 'Global')" },
          },
          required: ["Severity", "Heuristic_Type", "Issue_Title", "Description", "Recommendation"]
        },
      },
      {
        name: "add_functional_bug",
        description: "Add a new Functional or E2E Bug finding to the dashboard database.",
        inputSchema: {
          type: "object",
          properties: {
            Severity: { type: "number", description: "Severity 0 to 4 (e.g. 4 for crashes)" },
            Component: { type: "string", description: "Which part of the app broke (e.g. 'Login Form', 'API /login')" },
            Issue_Title: { type: "string", description: "Short title of the bug" },
            Description: { type: "string", description: "Detailed description of the bug, including console errors if any" },
            Recommendation: { type: "string", description: "How to fix the bug (technical suggestion)" },
            User_Story_Context: { type: "string", description: "The ID or Title of the User Story this relates to" },
          },
          required: ["Severity", "Component", "Issue_Title", "Description", "Recommendation"]
        },
      },
      {
        name: "add_user_story",
        description: "Add a new user story / test case to the database.",
        inputSchema: {
          type: "object",
          properties: {
            Title: { type: "string" },
            User_Story: { type: "string" },
            Acceptance_Criteria: { type: "array", items: { type: "string" } }
          },
          required: ["Title", "User_Story", "Acceptance_Criteria"]
        }
      },
      {
        name: "get_knowledge_base",
        description: "Retrieve all Knowledge Base (KMS) rules and guidelines from the HE SUITE.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "he_suite_help",
        description: "Provides instructions on how to use HE_SUITE. Call this tool when the user asks for help or how to use the suite.",
        inputSchema: { type: "object", properties: {} },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === "get_user_stories") {
      const data = await fs.readFile(STORIES_PATH, "utf-8").catch(() => "[]");
      let stories = [];
      try {
        stories = JSON.parse(data);
      } catch(e) {}
      // Filter out stories that are explicitly marked as inactive
      const activeStories = stories.filter(s => s.isActive !== false);
      return { content: [{ type: "text", text: JSON.stringify(activeStories, null, 2) }] };
    }
    
    else if (request.params.name === "add_he_finding") {
      const data = await fs.readFile(FINDINGS_PATH, "utf-8").catch(() => "[]");
      let findings = JSON.parse(data);
      
      const newFinding = {
        ID: "HE-" + Date.now().toString().slice(-4),
        Type: "UX",
        Severity: request.params.arguments.Severity,
        Heuristic_Type: request.params.arguments.Heuristic_Type,
        Issue_Title: request.params.arguments.Issue_Title,
        Description: request.params.arguments.Description,
        Recommendation: request.params.arguments.Recommendation,
        User_Story_Context: request.params.arguments.User_Story_Context || "Global"
      };
      
      findings.unshift(newFinding);
      await safeWrite(FINDINGS_PATH, JSON.stringify(findings, null, 2));
      return { content: [{ type: "text", text: `Successfully added HE Finding: ${newFinding.ID}` }] };
    }

    else if (request.params.name === "add_functional_bug") {
      const data = await fs.readFile(FINDINGS_PATH, "utf-8").catch(() => "[]");
      let findings = JSON.parse(data);
      
      const newBug = {
        ID: "BUG-" + Date.now().toString().slice(-4),
        Type: "Functional",
        Severity: request.params.arguments.Severity,
        Heuristic_Type: "Functional: " + request.params.arguments.Component,
        Issue_Title: request.params.arguments.Issue_Title,
        Description: request.params.arguments.Description,
        Recommendation: request.params.arguments.Recommendation,
        User_Story_Context: request.params.arguments.User_Story_Context || "Global"
      };
      
      findings.unshift(newBug);
      await safeWrite(FINDINGS_PATH, JSON.stringify(findings, null, 2));
      return { content: [{ type: "text", text: `Successfully added Functional Bug: ${newBug.ID}` }] };
    }
    
    else if (request.params.name === "add_user_story") {
      const data = await fs.readFile(STORIES_PATH, "utf-8").catch(() => "[]");
      let stories = JSON.parse(data);
      
      const newStory = {
        ID: "US" + Date.now().toString().slice(-4),
        Title: request.params.arguments.Title,
        User_Story: request.params.arguments.User_Story,
        Acceptance_Criteria: request.params.arguments.Acceptance_Criteria
      };
      
      stories.push(newStory);
      await safeWrite(STORIES_PATH, JSON.stringify(stories, null, 2));
      return { content: [{ type: "text", text: `Successfully added User Story: ${newStory.ID}` }] };
    }
    
    else if (request.params.name === "get_knowledge_base") {
      let kbData = {};
      try {
        const files = await fs.readdir(KB_PATH);
        for (const file of files) {
          if (file.endsWith('.md')) {
            const content = await fs.readFile(path.join(KB_PATH, file), 'utf-8');
            kbData[file] = content;
          }
        }
      } catch (err) {
        // If directory doesn't exist, it just returns empty object
      }
      return { content: [{ type: "text", text: JSON.stringify(kbData, null, 2) }] };
    }

    else if (request.params.name === "he_suite_help") {
      const helpText = `
# HE_SUITE Agent Manual
You are connected to HE_SUITE via MCP. Here is how you can help the user:

1. **Running a Crawl**: The user can run \`he-suite HE <url>\` in their terminal to generate a crawler report.
2. **Evaluating**: Once the crawl is done, the user will ask you to evaluate it. You should:
   - Read \`crawler_report.json\` in the workspace.
   - Read \`crawler_screenshot.png\` visually.
   - Cross-reference the UI with the Knowledge Base (use \`get_knowledge_base\` tool).
3. **Logging Issues**: Use the \`add_he_finding\` or \`add_functional_bug\` tools to log any violations you find!
`;
      return { content: [{ type: "text", text: helpText }] };
    }
    
    else {
      throw new Error("Unknown tool");
    }
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("HE SUITE MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error in main():", err);
  process.exit(1);
});
