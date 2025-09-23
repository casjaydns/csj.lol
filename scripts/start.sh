#!/usr/bin/env sh
# shellcheck shell=sh
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
##@Version           :  202412190758-git
# @@Author           :  Jason Hempstead
# @@Contact          :  jason@casjaysdev.pro
# @@License          :  LICENSE.md
# @@ReadME           :  start.sh --help
# @@Copyright        :  Copyright: (c) 2024 Jason Hempstead, Casjays Developments
# @@Created          :  Thursday, Dec 19, 2024 08:09 EST
# @@File             :  start.sh
# @@Description      :
# @@Changelog        :  New script
# @@TODO             :  Better documentation
# @@Other            :
# @@Resource         :
# @@Terminal App     :  no
# @@sudo/root        :  no
# @@Template         :  shell/sh
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# shellcheck disable=SC1003,SC2016,SC2031,SC2120,SC2155,SC2199,SC2317
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
APPNAME="$(basename -- "$0" 2>/dev/null)"
VERSION="202412190758-git"
RUN_USER="$USER"
SET_UID="$(id -u)"
SCRIPT_SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
START_SH_CWD="$(realpath "$SCRIPT_SRC_DIR/..")"
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# colorization
if [ "$SHOW_RAW" = "true" ]; then
  __printf_color() { printf '%b' "$1\n" | tr -d '\t' | sed '/^%b$/d;s,\x1B\[ 0-9;]*[a-zA-Z],,g'; }
else
  __printf_color() { { [ -z "$2" ] || DEFAULT_COLOR=$2; } && printf "%b" "$(tput setaf "$DEFAULT_COLOR" 2>/dev/null)" "$1\n" "$(tput sgr0 2>/dev/null)"; }
fi
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# check for command
__cmd_exists() { which "$1" >/dev/null 2>&1 || return 1; }
__function_exists() { builtin type $1 >/dev/null 2>&1 || return 1; }
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# custom functions

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# Define variables
DEFAULT_COLOR="254"
START_SH_EXIT_STATUS=0
export NODE_ENV=production
cd "$START_SH_CWD"
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
if [ -n "$(which fnm 2>/dev/null)" ]; then eval "$(fnm env)"; fi
if [ -f "$START_SH_CWD/.env" ]; then
  . "$START_SH_CWD/.env"
fi
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# Main application
case "$1" in
i | install)
  shift 1
  npm i -d
  ;;
dev | development)
  shift 1
  if [ "$1" = "remote" ]; then
    shift 1
    while :; do
      git pull
      sleep 10
    done &
  fi
  export NODE_ENV=development
  if docker ps -a 2>&1 | grep -qE 'mongo|:27017/'; then
    docker run --name mongo -d -v /tmp/mongodb:/data/db -p 127.0.0.1:27017:27017 mongo:latest
  fi
  npm run dev
  ;;
prod | production)
  shift 1
  # contrib/csj.lol.nginx.conf  contrib/csj.lol.systemd.service
  if [ f "contrib/csj.lol.nginx.conf" ] && [ -w "/etc/nginx/vhosts.d" ]; then
    cp -Rf "contrib/csj.lol.nginx.conf" "/etc/nginx/vhosts.d/csj.lol.conf"
    cp -Rf "contrib/csj.lol.systemd.service" "/etc/systemd/system/csj-lol.service"
    systemctl daemon-reload
    systemctl restart nginx
    systemctl enable --now csj-lol.service
  fi
  npm run start
  ;;
uninstall)
  systemctl disable --now "csj-lol.service"
  [ -d "./node_modules" ] && rm -Rf "./node_modules"
  [ -f "/etc/nginx/vhosts.d/csj.lol.conf" ] && rm -Rf "/etc/nginx/vhosts.d/csj.lol.conf"
  [ -f "/etc/systemd/system/csj-lol.service" ] && rm -Rf "/etc/systemd/system/csj-lol.service"
  systemctl daemon-reload
  systemctl restart nginx
  ;;
*)
  npm i -D && npm run start
  ;;
esac
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# End application
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# lets exit with code
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
exit $START_SH_EXIT_STATUS
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# ex: ts=2 sw=2 et filetype=sh
