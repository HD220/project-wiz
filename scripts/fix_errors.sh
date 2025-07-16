#!/bin/bash

REPORT_FILE="report.txt"

echo "Starting automated error fixing process..."
echo "This script will call the 'claude' CLI for each error reported in $REPORT_FILE."
echo "BE AWARE: The '--dangerously-skip-permissions' flag means Claude will attempt to fix issues autonomously."
echo ""
echo "Supported error types:"
echo "  - ESLint warnings (from npm run lint:check)"
echo "  - TypeScript errors (from npm run type-check)"
echo "  - Multi-line error messages"
echo ""

# Generate the report by running quality:check
echo "Generating quality check report..."
npm run quality:check > "$REPORT_FILE" 2>&1

if [ ! -f "$REPORT_FILE" ]; then
    echo "Error: $REPORT_FILE was not generated."
    exit 1
fi

echo "Report file found. Processing..."

declare -A file_errors_map # Associative array to store errors per file
current_file=""
line_count=0

# Read the report file line by line
while IFS= read -r line; do
    ((line_count++))
    # Skip empty lines or lines that are not error reports (e.g., summary lines)
    if [[ -z "$line" || "$line" == *"problems"* || "$line" == "> project-wiz@"* || "$line" == "✖"* ]]; then
        continue
    fi
	
	# Check if the line starts with the project path, indicating a new file (lint format)
    if [[ "$line" == "/mnt/d/Documentos/Pessoal/Github/project-wiz"* ]]; then
        current_file="$line"
        # Initialize the entry for the new file if it doesn't exist
        if [[ -z "${file_errors_map[$current_file]}" ]]; then
            file_errors_map[$current_file]=""
        fi
    # Check if the line contains TypeScript error format: src/path/file.ts(line,col): error TS...
    elif [[ "$line" =~ ^src/[^:]+\([0-9]+,[0-9]+\):\ error\ TS[0-9]+: ]]; then
        # Extract the file path from TypeScript error format
        typescript_file=$(echo "$line" | sed 's/^\(src\/[^(]*\)(.*$/\1/')
        current_file="/mnt/d/Documentos/Pessoal/Github/project-wiz/$typescript_file"
        
        # Extract the error message (everything after the error code)
        error_message=$(echo "$line" | sed 's/^[^:]*: error [^:]*: //')
        
        if [[ -n "$error_message" ]]; then
            # Initialize the entry for the new file if it doesn't exist
            if [[ -z "${file_errors_map[$current_file]}" ]]; then
                file_errors_map[$current_file]=""
            fi
            
            # Append the error message to the current file's entry in the map
            if [[ -n "${file_errors_map[$current_file]}" ]]; then
                file_errors_map[$current_file]+="; "
            fi
            file_errors_map[$current_file]+="$error_message"
        fi
    # Check if this line is a continuation of a multi-line error message
    elif [[ -n "$current_file" && "$line" =~ ^[[:space:]]*[^/[:space:]] ]]; then
        # This is likely a continuation line, append to current file's errors
        continuation_text=$(echo "$line" | sed 's/^[[:space:]]*//')
        if [[ -n "$continuation_text" && ! "$continuation_text" =~ ^(✖|>|npm|node:|Use|Reparsing|To eliminate) ]]; then
            # Only append if it's not a summary line or command output
            if [[ -n "${file_errors_map[$current_file]}" ]]; then
                file_errors_map[$current_file]+=" $continuation_text"
            fi
        fi
    else
        # This is an error detail line for lint warnings
        # Extract the error message (everything after the type, e.g., 'error' or 'warning')
        # Example:   21:7  error  React Hook "useChannelMessagesById" is called conditionally. ...
        if [[ "$line" =~ ^[[:space:]]*[0-9]+:[0-9]+[[:space:]]+(error|warning)[[:space:]]+ ]]; then
            error_message=$(echo "$line" | awk '{$1=$2=$3=""; print $0}' | sed 's/^[ 	]*//')

            if [[ -n "$current_file" && -n "$error_message" ]]; then
                # Append the error message to the current file's entry in the map
                # Add a separator if there are already errors for this file
                if [[ -n "${file_errors_map[$current_file]}" ]]; then
                    file_errors_map[$current_file]+="; "
                fi
                file_errors_map[$current_file]+="$error_message"
            fi
        fi
    fi
done < "$REPORT_FILE"

echo "Finished parsing report file."
echo "Total lines processed: $line_count"

# Debug: show all files found
echo "Files found with errors:"
for file_path in "${!file_errors_map[@]}"; do
    echo "  - $file_path"
done

# Now iterate through the map and execute claude for each file
echo "Processing files with errors..."
file_count=0
total_files=${#file_errors_map[@]}
echo "Total files to process: $total_files"

for file_path in "${!file_errors_map[@]}"; do
    errors_for_file="${file_errors_map[$file_path]}"
    if [[ -n "$errors_for_file" ]]; then
        ((file_count++))
        
        # Escape double quotes in the error messages for the prompt
        escaped_errors=$(echo "$errors_for_file" | sed 's/"/\\"/g')
        # Convert absolute path to relative path with @ prefix
        relative_file_path=$(echo "$file_path" | sed 's|/mnt/d/Documentos/Pessoal/Github/project-wiz/|@|')
        
        echo "[$file_count/$total_files] Processing file: $relative_file_path"
        echo "Errors to fix: $errors_for_file"
        echo "Calling Claude..."
        
        # Execute claude command and capture output
        echo "Corrija os seguintes problemas no arquivo $relative_file_path: $escaped_errors. Seguindo as diretrizes de @CLAUDE.md, NÃO EXECUTE NENHUM COMANDO DO NODEJS(LINT,TYPE-CHECK,ETC.)" | gemini --yolo --model=gemini-2.5-flash -p # claude --dangerously-skip-permissions -p
        
        echo "Completed processing $relative_file_path"
        echo "----------------------------------------"
    fi
done

echo "All files processed!"
echo "Total files fixed: $file_count"
