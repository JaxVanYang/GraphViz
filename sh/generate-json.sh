#!/usr/bin/env bash
# Generate a JSON to list all graph examples.

set -e

script_dir=$(dirname "$0")
cd "$script_dir"

graphs_dir="../api/graphs"
# This json file serves as a static API
json="../api/graphs.json"

printf '[' > $json
format_str='"%s"'
for file in "$graphs_dir"/*; do
	# shellcheck disable=SC2059
	printf "$format_str" "$(basename "$file")" >> $json
	if [ "$format_str" = '"%s"' ]; then
		format_str=",$format_str"
	fi
done
printf ']' >> $json
