# Custom Prompts Documentation

AIxHE supports the use of custom "Prompt Profiles" to alter the behavior of the evaluation agent. These prompts define the instructions, rules, and expected JSON formatting for the AI.

## Available Profiles

### 1. Default Profile (`default_nngroup.txt`)
- **Location:** `prompt_profiles/default_nngroup.txt`
- **Purpose:** This is the standard, default evaluation prompt. It instructs the AI to evaluate interfaces strictly against **Jakob Nielsen's 10 Usability Heuristics**.
- **Output:** Returns a JSON array where the `"heuristic"` field contains the name of the Nielsen heuristic violated.

### 2. Multi-Framework Profile (`multi_framework.txt`)
- **Location:** `prompt_profiles/multi_framework.txt`
- **Purpose:** A comprehensive evaluation prompt designed to test the interface against multiple industry standards simultaneously.
- **Frameworks Checked:**
  1. Nielsen's 10 Usability Heuristics (NNgroup)
  2. Ben Shneiderman's 8 Golden Rules of Interface Design
  3. Web Content Accessibility Guidelines (WCAG) POUR Principles
- **Output:** Returns a JSON array where the `"heuristic"` field concatenates all applicable principles from the three frameworks (e.g., `"NNgroup: H3 User Control, Shneiderman: #6 Easy Reversal"`). This allows the application to map multiple framework violations to a single finding without altering the core database structure.

## How to Add Your Own Custom Prompt
Because the prompt templates are stored as standard `.txt` files in the `prompt_profiles/` folder, you can easily share or add your own!

1. Create a new `.txt` file inside `prompt_profiles/` (e.g., `ecommerce_audit.txt`).
2. Write your custom instructions. **Important:** Ensure you maintain the strict JSON output structure requirements listed at the bottom of the default prompts. The application's UI relies on exactly 5 JSON keys: `heuristic`, `severity`, `title`, `description`, and `recommendation`.
3. Open `index.html` in a text editor.
4. Locate the `<select id="prompt-profile-select">` dropdown element (around line 380).
5. Add a new `<option value="ecommerce_audit.txt">My E-commerce Prompt</option>`.
6. Save the file and reload your browser! Your new profile will instantly load when selected in the Settings tab.
