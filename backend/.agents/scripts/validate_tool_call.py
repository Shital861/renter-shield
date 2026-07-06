import json
import sys


def main():
    try:
        input_data = json.load(sys.stdin)
    except Exception as e:
        print(f"Error: Invalid JSON input on stdin: {e}", file=sys.stderr)
        sys.exit(0)  # Do not block if input format is unexpected

    tool_input = input_data.get("tool_input", {})
    if not isinstance(tool_input, dict):
        cmd = str(tool_input)
    else:
        cmd = tool_input.get(
            "CommandLine", tool_input.get("command", tool_input.get("cmd", ""))
        )
        if not cmd:
            cmd = " ".join([str(v) for v in tool_input.values()])

    cmd_upper = cmd.upper()
    cmd_lower = cmd.lower()

    # Destructive patterns
    blocked_patterns = ["rm -rf /", "rm -rf ~", "format C:", "shutdown"]

    for pattern in blocked_patterns:
        if pattern.lower() in cmd_lower:
            print(
                f"Command blocked: Destructive command '{pattern}' detected.",
                file=sys.stderr,
            )
            sys.exit(1)

    if "DROP TABLE" in cmd_upper:
        print(
            "Command blocked: Destructive command 'DROP TABLE' detected.",
            file=sys.stderr,
        )
        sys.exit(1)

    if "DELETE FROM" in cmd_upper and "WHERE" not in cmd_upper:
        print(
            "Command blocked: Destructive command 'DELETE FROM' without WHERE clause detected.",
            file=sys.stderr,
        )
        sys.exit(1)

    print("Command approved")
    sys.exit(0)


if __name__ == "__main__":
    main()
