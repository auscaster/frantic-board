#!/usr/bin/env bash
# prints a greeting for the given name; promises "hello, <name>"
printf 'helo, %s\n' "${1:-world}"
