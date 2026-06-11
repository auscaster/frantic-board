#!/usr/bin/env bash
# expects cwd = the source tree under test
out="$(bash greet.sh world)"
[ "$out" = "hello, world" ]
