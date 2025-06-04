#!/bin/bash

# 변수
fixed_prefix="192.168.0."
source=""
target=""
fixed_source=""
fixed_target=""
dirs=()

function echoError() {
  echo "### Error - Unknown Option: Example $0 -<source> --<target> <dir1> <dir2> ..."
  exit 1
}

if [ $# -lt 3 ]; then
  echoError
fi

for arg in "$@"; do
  if [[ "$arg" == -* && "$arg" != --* ]]; then
    if [ -z "$source" ]; then
      source="${arg:1}"
    else
      echoError
    fi
  elif [[ "$arg" == --* ]]; then
    if [ -z "$target" ]; then
      target="${arg:2}"
    else
      echoError
    fi
  else
    dirs+=("$arg")
  fi
done

if [ -z "$source" ]; then
  echoError
fi

if [ -z "$target" ]; then
  echoError
fi

if [ "${#dirs[@]}" -eq 0 ]; then
  echoError
fi

if [ "$source" == "local" ]; then
  fixed_source="localhost"
else
  fixed_source="${fixed_prefix}${source}"
fi

if [ "$target" == "local" ]; then
  fixed_target="localhost"
else
  fixed_target="${fixed_prefix}${target}"
fi

for dir in "${dirs[@]}"; do
  env_file="./apps/$dir/.env"

  if [ -f "$env_file" ]; then
    echo "### Processing $dir..."
    # 슬래시를 이스케이프한 고정된 source와 target
    escaped_source=$(echo "$fixed_source" | sed 's/\//\\\//g')
    escaped_target=$(echo "$fixed_target" | sed 's/\//\\\//g')
    
    # sed 명령어에서 이스케이프된 문자열 사용
    sed -i '' "s|$escaped_source|$escaped_target|g" "$env_file"
    echo "### Success Change $fixed_source to $fixed_target in $dir"
  else
    echo "### Warning - $env_file does not exist. (Skip)"
  fi
done

echo "### End!"