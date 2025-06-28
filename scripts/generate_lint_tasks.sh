#!/bin/bash

set -e # Exit immediately if a command exits with a non-zero status.
set -u # Treat unset variables as an error when substituting.

# --- Configuration ---
JULES_DIR=".jules"
TASKS_DIR="$JULES_DIR/tasks"
TEMPLATES_DIR="$JULES_DIR/templates"
TASK_DETAIL_TEMPLATE="$TEMPLATES_DIR/TASK_DETAIL_TEMPLATE.md"
TASKS_INDEX_FILE="$JULES_DIR/TASKS.md"
LINT_OUTPUT_FILE="lint_output.json" # Default input file

# Batch processing parameters
BATCH_FILE_OFFSET=${1:-0}
BATCH_FILE_LIMIT=${2:-0} # 0 means no limit, process all from offset

# --- Helper Functions ---

generate_file_task_id() {
  local file_path="$1"
  local sanitized_path_part=$(echo "$file_path" | tr '/' '_' | tr '.' '_' | tr -dc '[:alnum:]_')
  local hash=$(echo -n "$file_path" | sha256sum | cut -c1-8)
  echo "LINT-FILE-${sanitized_path_part:0:30}-${hash}"
}

fill_template() {
  local template_content="$1"
  local placeholder_name_in_brackets="[$2]"
  local value_content="$3"
  REPLACEMENT_VALUE_FOR_AWK="$value_content" awk -v tag_to_replace="$placeholder_name_in_brackets" '
    BEGIN { RS = "^$"; ORS = ""; replacement = ENVIRON["REPLACEMENT_VALUE_FOR_AWK"]; }
    {
      idx = index($0, tag_to_replace);
      if (idx > 0) { print substr($0, 1, idx-1) replacement substr($0, idx + length(tag_to_replace)); }
      else { print $0; }
    }
  ' <<< "$template_content"
  unset REPLACEMENT_VALUE_FOR_AWK
}

# --- Main Script Logic ---
echo "Starting task generation (one task per file with lint issues)..."
mkdir -p "$TASKS_DIR"

if [ ! -f "$LINT_OUTPUT_FILE" ]; then echo "Error: Lint output file '$LINT_OUTPUT_FILE' not found." >&2; exit 1; fi
if ! command -v jq &> /dev/null; then echo "Error: 'jq' command is not installed." >&2; exit 1; fi
if [ ! -f "$TASK_DETAIL_TEMPLATE" ]; then echo "Error: Task detail template '$TASK_DETAIL_TEMPLATE' not found." >&2; exit 1; fi
DETAIL_TEMPLATE_CONTENT=$(cat "$TASK_DETAIL_TEMPLATE")

if [ ! -s "$TASKS_INDEX_FILE" ]; then
  echo "Creating new $TASKS_INDEX_FILE with header..."
  if [ ! -f "$TEMPLATES_DIR/TASK_INDEX_TEMPLATE.md" ]; then echo "Error: Task index template '$TEMPLATES_DIR/TASK_INDEX_TEMPLATE.md' not found." >&2; exit 1; fi
  cat "$TEMPLATES_DIR/TASK_INDEX_TEMPLATE.md" > "$TASKS_INDEX_FILE"
  [[ $(tail -c1 "$TASKS_INDEX_FILE" | wc -l) -eq 0 ]] && echo "" >> "$TASKS_INDEX_FILE"
fi

EXISTING_TASK_IDS=()
if [ -f "$TASKS_INDEX_FILE" ]; then
  while IFS= read -r line; do
    if [[ "$line" != *\|* || "$line" == \|-*-\| ]]; then continue; fi
    id_part=$(echo "$line" | cut -d'|' -f2 | xargs)
    if [[ -n "$id_part" && "$id_part" != "ID da Tarefa" ]]; then EXISTING_TASK_IDS+=("$id_part"); fi
  done < <(tail -n +6 "$TASKS_INDEX_FILE" 2>/dev/null || true)
fi

tasks_appended_count=0

mapfile -t all_file_entries < <(jq -c '.[] | select(.messages and (.messages | length > 0))' "$LINT_OUTPUT_FILE")
if [ $? -ne 0 ]; then echo "Error: Failed to read or parse $LINT_OUTPUT_FILE with jq." >&2; exit 1; fi
total_files_with_messages=${#all_file_entries[@]}
echo "Found $total_files_with_messages files with lint messages in $LINT_OUTPUT_FILE."

files_to_process=()
current_offset=$BATCH_FILE_OFFSET
current_limit=$BATCH_FILE_LIMIT

if [ "$current_limit" -gt 0 ]; then
  echo "Processing files in batch: offset $current_offset, limit $current_limit"
  end_loop_idx=$((current_offset + current_limit))
  if [ $end_loop_idx -gt $total_files_with_messages ]; then
    end_loop_idx=$total_files_with_messages
  fi
  for ((idx=current_offset; idx<end_loop_idx; idx++)); do
    if [ -n "${all_file_entries[$idx]+isset}" ]; then files_to_process+=("${all_file_entries[$idx]}"); else echo "Warning: Index $idx out of bounds (total $total_files_with_messages)" >&2; fi
  done
else
  echo "Processing files from offset $current_offset to end (limit: $current_limit means all remaining)"
  for ((idx=current_offset; idx<total_files_with_messages; idx++)); do
     if [ -n "${all_file_entries[$idx]+isset}" ]; then files_to_process+=("${all_file_entries[$idx]}"); else echo "Warning: Index $idx out of bounds (total $total_files_with_messages)" >&2; fi
  done
fi

processed_file_count=${#files_to_process[@]}
if [ $processed_file_count -eq 0 ]; then
    echo "No files to process in the current batch (offset: $current_offset, limit: $current_limit, total files: $total_files_with_messages)."
else
    echo "Will process $processed_file_count file(s) in this batch."
fi

for file_entry in "${files_to_process[@]}"; do
  if ! echo "$file_entry" | jq -e . > /dev/null 2>&1; then
    echo "DEBUG: Skipping empty or invalid file_entry: '$file_entry'" >&2
    continue
  fi

  filePath=$(echo "$file_entry" | jq -r '.filePath' | sed 's|'$PWD'/||')
  errorCount=$(echo "$file_entry" | jq -r '.errorCount')
  warningCount=$(echo "$file_entry" | jq -r '.warningCount')
  totalIssues=$((errorCount + warningCount))

  echo "Processing file: $filePath ($totalIssues issues)"
  taskId=$(generate_file_task_id "$filePath")

  task_exists_in_index=0
  for existing_id_token in "${EXISTING_TASK_IDS[@]}"; do
    if [[ "$existing_id_token" == "$taskId" ]]; then task_exists_in_index=1; break; fi
  done

  if [ $task_exists_in_index -eq 1 ]; then
    echo "  Skipping task for file (already in index): $filePath (ID: $taskId)"
    continue
  fi

  task_detail_file="$TASKS_DIR/TSK-${taskId}.md"
  if [ -f "$task_detail_file" ]; then
    echo "  Skipping task for file (detail file exists): $filePath (ID: $taskId)"
    if ! grep -qF "|$taskId|" "$TASKS_INDEX_FILE"; then
       printf "| %s | Pendente |  | P2 | %s | [Link](./tasks/TSK-%s.md) |\n" "$taskId" "$totalIssues" "$taskId" >> "$TASKS_INDEX_FILE"
       echo "    (Appended missing index entry for existing file $taskId)"
       tasks_appended_count=$((tasks_appended_count + 1))
       EXISTING_TASK_IDS+=("$taskId")
    fi
    continue
  fi

  echo "  Generating task for file: $filePath (ID: $taskId)"
  description_header="**File:** \`$filePath\`\n**Total Issues:** $totalIssues (Errors: $errorCount, Warnings: $warningCount)\n\n**Lint Messages:**\n\n"
  messages_summary=$(echo "$file_entry" | jq -r '.messages[] | "- Line \(.line):\(.column) (\(.ruleId // "GENERAL")) - \(.message)"')
  description_for_template=$(echo -e "${description_header}""\`\`\`text\n${messages_summary}\n\`\`\`")

  complexity=1
  if [ "$totalIssues" -gt 10 ]; then complexity=3; elif [ "$totalIssues" -gt 5 ]; then complexity=2; fi
  priority="P3"; if [ "$errorCount" -gt 0 ]; then priority="P2"; fi
  task_title="Fix all $totalIssues lint issues in $filePath"

  content="$DETAIL_TEMPLATE_CONTENT"
  content=$(fill_template "$content" "ID_DA_TAREFA" "$taskId")
  content=$(fill_template "$content" "TÍTULO_BREVE_DA_TAREFA" "$task_title")
  content=$(fill_template "$content" "DESCRIÇÃO_COMPLETA_DA_TAREFA" "$description_for_template")
  content=$(fill_template "$content" "STATUS_ATUAL" "Pendente")
  content=$(fill_template "$content" "LISTA_DE_IDS_DE_DEPENDENCIA" "")
  content=$(fill_template "$content" "NÍVEL_DE_COMPLEXIDADE" "$complexity")
  content=$(fill_template "$content" "NÍVEL_DE_PRIORIDADE" "$priority")
  content=$(fill_template "$content" "NOME_DO_RESPONSÁVEL" "Jules (Automated)")
  content=$(fill_template "$content" "BRANCH_GIT_SUGERIDA" "fix/lint-file-${taskId}")
  content=$(fill_template "$content" "LINK_PARA_COMMIT_DE_CONCLUSÃO" "")
  content=$(fill_template "$content" "CRITÉRIO_1" "All lint errors in file \`$filePath\` are resolved.")
  content=$(fill_template "$content" "CRITÉRIO_2" "File \`$filePath\` passes \`npm run lint\` without errors/warnings listed.")
  content=$(fill_template "$content" "COMENTÁRIO_INICIAL_OU_DATA_DE_CRIAÇÃO" "$(date '+%Y-%m-%d %H:%M:%S') - Task automatically generated for lint issues in file.")

  echo -e "$content" > "$task_detail_file"
  printf "| %s | Pendente |  | %s | %s | [Link](./tasks/TSK-%s.md) |\n" "$taskId" "$priority" "$complexity" "$taskId" >> "$TASKS_INDEX_FILE"
  echo "    Appended task for file $filePath (ID: $taskId) to $TASKS_INDEX_FILE"
  tasks_appended_count=$((tasks_appended_count + 1))
  EXISTING_TASK_IDS+=("$taskId")
done

if [ "$tasks_appended_count" -gt 0 ]; then
  echo -e "\nSuccessfully generated and indexed $tasks_appended_count new task(s) (one per file) in this batch run."
else
  echo -e "\nNo new file-level lint tasks were generated or appended in this batch run."
fi

chmod +x scripts/generate_lint_tasks.sh
echo "Task generation complete."
echo "Summary: Processed '$LINT_OUTPUT_FILE'."
echo "Task detail files are in '$TASKS_DIR'."
echo "Task index is '$TASKS_INDEX_FILE'."
