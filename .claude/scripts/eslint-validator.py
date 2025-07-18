#!/usr/bin/env python3
import json
import sys
import subprocess
import os

def main():
    try:
        # Read hook input
        input_data = json.load(sys.stdin)
        tool_name = input_data.get("tool_name", "")
        tool_input = input_data.get("tool_input", {})
        file_path = tool_input.get("file_path", "")
        
        # Only process JavaScript/TypeScript files
        if not file_path.endswith(('.js', '.jsx', '.ts', '.tsx')):
            sys.exit(0)  # Success, but do nothing
            
        # Check if file exists and run ESLint
        if os.path.exists(file_path):
            result = subprocess.run(
                ['npx', 'eslint', file_path, '--format', 'json'],
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                # Parse ESLint output
                try:
                    lint_results = json.loads(result.stdout)
                    if lint_results and lint_results[0].get('messages'):
                        errors = [msg for msg in lint_results[0]['messages'] 
                                if msg['severity'] == 2]
                        if errors:
                            error_summary = f"ESLint found {len(errors)} error(s) in {file_path}:\n"
                            for error in errors[:3]:  # Show first 3 errors
                                error_summary += f"  Line {error['line']}: {error['message']}\n"
                            print(error_summary, file=sys.stderr)
                            sys.exit(2)  # Block the operation
                except json.JSONDecodeError:
                    pass
                    
        sys.exit(0)  # Success
        
    except Exception as e:
        print(f"Hook error: {e}", file=sys.stderr)
        sys.exit(1)  # Non-blocking error

if __name__ == "__main__":
    main()