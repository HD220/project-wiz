===
for github mcp json line break as `\n` and not include any caracterer before and after `{``}`, just plain body text string inline.
It is necessary to ensure that the JSON is completely inline, with no spaces, no special characters outside the strings, and that the block should not have anything before or after the JSON. In addition, there cannot be double closing of the tag or any line breaks outside the JSON.

exemple:
<use_mcp_tool>
<server_name>weather-server</server_name>
<tool_name>get_forecast</tool_name>
<arguments>{
  "city": "San Francisco",
  "days": 5
}</arguments>
</use_mcp_tool>

others infos:

for github issues create do not include `ISSUE-XXXX`, `handoff`, `categoria` and `prioridade` sections. Document/comment as a programmer, you don't need to follow strictly as it is in README.md or handoff.md. Not include comment with integral content of README.md. Do not include information about `handoff`, comment direct as a developer and not inform this. AWAYS Check if the issue should be closed.


NEVER use command of tool `attempt_completion`
NEVER use ask_followup_question, use `attempt_completion`

use ONLY permited commands: del, rm, ren, cp, move, mkdir, git, rename

