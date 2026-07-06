import json
import sys


def main():
    try:
        input_data = json.load(sys.stdin)
    except Exception as e:
        print(f"Error: Invalid JSON input on stdin: {e}", file=sys.stderr)
        sys.exit(0)

    tool_input = input_data.get("tool_input", {})
    if not isinstance(tool_input, dict):
        print("PII boundary clear")
        sys.exit(0)

    renter_name = tool_input.get("renter_name", "")
    landlord_name = tool_input.get("landlord_name", "")

    # Check for raw PII values leaks in other tool arguments
    check_values = []
    if renter_name and renter_name != "{RENTER}":
        check_values.append(("renter_name", renter_name))
    if landlord_name and landlord_name != "{LANDLORD}":
        check_values.append(("landlord_name", landlord_name))

    for field_name, pii_val in check_values:
        for k, v in tool_input.items():
            if k == field_name:
                continue
            if isinstance(v, str) and pii_val in v:
                print(
                    f"PII Leak Detected: Raw value of '{field_name}' ('{pii_val}') found verbatim in field '{k}' ('{v}').",
                    file=sys.stderr,
                )
                sys.exit(1)

    print("PII boundary clear")
    sys.exit(0)


if __name__ == "__main__":
    main()
