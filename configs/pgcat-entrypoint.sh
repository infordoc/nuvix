#!/usr/bin/env bash
set -euo pipefail

TEMPLATE="/etc/pgcat/pgcat.toml.template"
OUTPUT="/etc/pgcat/pgcat.toml"

# Read the template line by line and replace ${VAR} with environment variables
> "$OUTPUT"  # truncate/create the output file

while IFS= read -r line; do
    # Replace ${VAR} with the value of the environment variable
    # This works for both quoted strings and numeric values
    while [[ "$line" =~ (\$\{([A-Za-z_][A-Za-z0-9_]*)\}) ]]; do
        VAR_NAME="${BASH_REMATCH[2]}"
        VAR_VALUE="${!VAR_NAME:-}"  # default empty if not set
        # Escape backslashes and slashes in value
        VAR_VALUE="${VAR_VALUE//\\/\\\\}"
        VAR_VALUE="${VAR_VALUE//\//\\/}"
        line="${line//${BASH_REMATCH[1]}/$VAR_VALUE}"
    done
    echo "$line" >> "$OUTPUT"
done < "$TEMPLATE"

# Execute PgCat with the generated config
exec pgcat "$OUTPUT"
