#!/bin/bash

set -e # Exit immediately if a command exits with a non-zero status.
set -u # Treat unset variables as an error when substituting.
# set -o pipefail # Causes a pipeline to return the exit status of the last command in the pipe that returned a non-zero return value.

# --- Configuration ---
JULES_DIR=".jules"
TASKS_DIR="$JULES_DIR/tasks"
TEMPLATES_DIR="$JULES_DIR/templates"
TASK_DETAIL_TEMPLATE="$TEMPLATES_DIR/TASK_DETAIL_TEMPLATE.md"
TASKS_INDEX_FILE="$JULES_DIR/TASKS.md"
LINT_OUTPUT_FILE="lint_output.json" # Default input file

# --- Helper Functions ---

# Function to generate a unique task ID
# Uses a simple SHA256 hash of relevant error details
generate_task_id() {
  local file_path="$1"
  local line_number="$2"
  local rule_id="$3"
  # Sanitize rule_id to be filesystem-friendly (remove slashes, etc.)
  local sanitized_rule_id=$(echo "$rule_id" | tr -c '[:alnum:]-' '_')
  local identifier_string="${file_path}-${line_number}-${sanitized_rule_id}"
  # Take first 8 chars of sha256 hash for brevity
  local hash=$(echo -n "$identifier_string" | sha256sum | cut -c1-8)
  echo "LINT-${sanitized_rule_id}-${hash}"
}

# Function to safely replace placeholders in a template
# Usage: fill_template <template_content> <placeholder> <value>
fill_template() {
  local template_content="$1"
  local placeholder="$2"
  local value="$3"
  # Ensure the placeholder is treated literally and value is escaped for sed
  # This is tricky with sed; using awk might be safer for complex values
  # For now, simple string replacement. Be cautious with special characters in value.
  # A more robust approach would use a templating engine or a language like Python/Node.js for this.
  echo "$template_content" | sed "s|\[$placeholder\]|${value}|g"
}


# --- Main Script Logic ---

echo "Starting task generation from lint report..."

# 0. Ensure tasks directory exists
mkdir -p "$TASKS_DIR"

# 1. Check if lint output file exists
if [ ! -f "$LINT_OUTPUT_FILE" ]; then
  echo "Error: Lint output file '$LINT_OUTPUT_FILE' not found."
  echo "Please run ESLint with JSON output first, e.g.:"
  echo "npm run lint -- --format json > $LINT_OUTPUT_FILE"
  exit 1
fi

# 2. Read and parse lint output (assuming JSON format from ESLint)
# This requires 'jq' to be installed.
if ! command -v jq &> /dev/null; then
  echo "Error: 'jq' command is not installed. Please install jq to parse JSON."
  exit 1
fi

# Read the detail template content once
if [ ! -f "$TASK_DETAIL_TEMPLATE" ]; then
  echo "Error: Task detail template '$TASK_DETAIL_TEMPLATE' not found."
  exit 1
fi
DETAIL_TEMPLATE_CONTENT=$(cat "$TASK_DETAIL_TEMPLATE")

# Read the existing tasks index, or prepare header if it doesn't exist or is empty
EXISTING_TASK_IDS=()
tasks_appended_count=0

# Ensure TASKS_INDEX_FILE has header if it's new or empty
if [ ! -s "$TASKS_INDEX_FILE" ]; then
  echo "Creating new $TASKS_INDEX_FILE with header..."
  if [ ! -f "$TEMPLATES_DIR/TASK_INDEX_TEMPLATE.md" ]; then
      echo "Error: Task index template '$TEMPLATES_DIR/TASK_INDEX_TEMPLATE.md' not found."
      exit 1
  fi
  cat "$TEMPLATES_DIR/TASK_INDEX_TEMPLATE.md" > "$TASKS_INDEX_FILE"
  # Add a newline if the template doesn't end with one, before appending tasks
  [[ $(tail -c1 "$TASKS_INDEX_FILE" | wc -l) -eq 0 ]] && echo "" >> "$TASKS_INDEX_FILE"
fi

if [ -f "$TASKS_INDEX_FILE" ]; then
  # Extract existing task IDs from the index to avoid duplicates
  # Skip header lines (typically 3 lines: title, separator, blank before table)
  # then extract the content of the first column (between pipes) and trim it.
  # Skip header lines (typically 3 lines for title, 1 for separator, 1 for column headers = 5 lines)
  # Only process lines that actually look like table rows (contain '|')
  while IFS= read -r line; do
    if [[ "$line" != *\|* || "$line" == \|-*-\| ]]; then # Skip non-table rows and separator line
        continue
    fi
    id_part=$(echo "$line" | cut -d'|' -f2)
    trimmed_id=$(echo "$id_part" | xargs) # xargs trims leading/trailing whitespace
    if [[ -n "$trimmed_id" && "$trimmed_id" != "ID da Tarefa" ]]; then
      EXISTING_TASK_IDS+=("$trimmed_id")
    fi
  done < <(tail -n +6 "$TASKS_INDEX_FILE" 2>/dev/null || true)
fi
# Remove the debug echo for final version
# echo "DEBUG: Initial EXISTING_TASK_IDS: ${EXISTING_TASK_IDS[*]}"


# Process each file's messages
while IFS= read -r file_entry; do
  filePath=$(echo "$file_entry" | jq -r '.filePath' | sed 's|'$PWD'/||') # make path relative

  echo "Processing errors in: $filePath"

  # Use process substitution for the inner loop as well to avoid subshell issues for any potential variable modifications
  # although with direct append, it's less critical for NEW_TASKS_ENTRIES.
  while IFS= read -r message_entry; do
    ruleId=$(echo "$message_entry" | jq -r '.ruleId // "GENERAL"') # Use GENERAL if ruleId is null
    line=$(echo "$message_entry" | jq -r '.line // "0"')
    column=$(echo "$message_entry" | jq -r '.column // "0"')
    message=$(echo "$message_entry" | jq -r '.message')
    severity=$(echo "$message_entry" | jq -r '.severity') # 1 for warning, 2 for error

    # Determine priority based on severity (P2 for error, P3 for warning)
    priority="P3"
    if [ "$severity" == "2" ]; then
      priority="P2"
    fi

    taskId=$(generate_task_id "$filePath" "$line" "$ruleId")

    # Check if task already exists in index
    task_exists_in_index=0
    # echo "  DEBUG: Checking taskId '$taskId' against EXISTING_TASK_IDS:" # Debug line
    for existing_id in "${EXISTING_TASK_IDS[@]}"; do
      # echo "  DEBUG:   Comparing with '$existing_id'" # Debug line
      if [[ "$existing_id" == "$taskId" ]]; then
        # echo "  DEBUG:   Match found!" # Debug line
        task_exists_in_index=1
        break
      fi
    done
    # echo "  DEBUG: task_exists_in_index is $task_exists_in_index" # Debug line

    if [ $task_exists_in_index -eq 1 ]; then
      echo "  Skipping existing task (found in index): $taskId for $filePath:$line"
      continue
    fi

    task_detail_file="$TASKS_DIR/TSK-${taskId}.md"
    if [ -f "$task_detail_file" ]; then
      echo "  Skipping existing task (detail file exists): $taskId for $filePath:$line"
      # If file exists but not in index, add it to index
      # This check should be robust now due to EXISTING_TASK_IDS being accurate from the start of the run
      if ! grep -qF "|$taskId|" "$TASKS_INDEX_FILE"; then
         printf "| %s | Pendente |  | %s | 1 | [Link](./tasks/TSK-%s.md) |\n" "$taskId" "$priority" "$taskId" >> "$TASKS_INDEX_FILE"
         echo "  (Appended missing index entry for existing file $taskId)"
         tasks_appended_count=$((tasks_appended_count + 1))
         EXISTING_TASK_IDS+=("$taskId") # Add to in-memory list to prevent re-adding in this run
      fi
      continue
    fi

    echo "  Generating task: $taskId for $filePath:$line ($ruleId)"

    task_title="Fix lint error ${ruleId} in ${filePath}:${line}"
    escaped_message=$(echo "$message" | sed 's/"/\\"/g' | sed "s/'/\\'/g" | sed 's/`/\\`/g')
    task_description="**File:** \`${filePath}\`\n**Line:** \`${line}\`\n**Column:** \`${column}\`\n**Rule ID:** \`${ruleId}\`\n**Severity:** \`${severity}\`\n\n**Message:**\n\`\`\`\n${escaped_message}\n\`\`\`"

    content="$DETAIL_TEMPLATE_CONTENT"
    content=$(fill_template "$content" "ID_DA_TAREFA" "$taskId")
    content=$(fill_template "$content" "TÍTULO_BREVE_DA_TAREFA" "$task_title")
    content=$(fill_template "$content" "DESCRIÇÃO_COMPLETA_DA_TAREFA" "$task_description")
    content=$(fill_template "$content" "STATUS_ATUAL" "Pendente")
    content=$(fill_template "$content" "LISTA_DE_IDS_DE_DEPENDENCIA" "")
    content=$(fill_template "$content" "NÍVEL_DE_COMPLEXIDADE" "1")
    content=$(fill_template "$content" "NÍVEL_DE_PRIORIDADE" "$priority")
    content=$(fill_template "$content" "NOME_DO_RESPONSÁVEL" "Jules (Automated)")
    content=$(fill_template "$content" "BRANCH_GIT_SUGERIDA" "fix/lint-${taskId}")
    content=$(fill_template "$content" "LINK_PARA_COMMIT_DE_CONCLUSÃO" "")
    content=$(fill_template "$content" "CRITÉRIO_1" "Lint error \`${ruleId}\` in \`${filePath}:${line}\` is resolved.")
    content=$(fill_template "$content" "CRITÉRIO_2" "Code passes \`npm run lint\` without this specific error.")
    content=$(fill_template "$content" "COMENTÁRIO_INICIAL_OU_DATA_DE_CRIAÇÃO" "$(date '+%Y-%m-%d %H:%M:%S') - Task automatically generated from lint report.")

    echo -e "$content" > "$task_detail_file"

    # Append entry directly to TASKS_INDEX_FILE
    printf "| %s | Pendente |  | %s | 1 | [Link](./tasks/TSK-%s.md) |\n" "$taskId" "$priority" "$taskId" >> "$TASKS_INDEX_FILE"
    echo "  Appended task $taskId to $TASKS_INDEX_FILE"
    tasks_appended_count=$((tasks_appended_count + 1))
    EXISTING_TASK_IDS+=("$taskId") # Add to in-memory list as well
  done < <(echo "$file_entry" | jq -c '.messages[]')
done < <(jq -c '.[] | select(.messages | length > 0)' "$LINT_OUTPUT_FILE")

# 4. Report result
if [ "$tasks_appended_count" -gt 0 ]; then
  echo -e "\nSuccessfully appended $tasks_appended_count task(s) to $TASKS_INDEX_FILE."
else
  echo "No new lint tasks to generate or append."
fi

# 5. Make script executable (should be done once, but good to include)
chmod +x scripts/generate_lint_tasks.sh

echo "Task generation complete."
echo "Summary: Processed '$LINT_OUTPUT_FILE'."
echo "Task detail files are in '$TASKS_DIR'."
echo "Task index is '$TASKS_INDEX_FILE'."
echo "Remember to commit the new/updated task files and this script."
echo "You might need to install 'jq': sudo apt-get install jq (or equivalent for your OS)"
