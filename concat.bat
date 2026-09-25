@echo off
REM === ScopeTester build for csurgay.com/syggen ===
REM   concat.bat        -> PRODUCTION: locked to csurgay.com only. Output source45.js (publish this).
REM   concat.bat dev    -> DEV test build: also allows localhost. Output source45.dev.js (never publish).
REM If Node.js is installed it also obfuscates; without Node it still builds a working, domain-locked file.

set SRC=fft.js globals.js buffer.js mic.js widget.js monitor.js knob.js button.js debug.js vfd.js scope.js scopeCalc.js scopeDraw.js scopeChannel.js readout.js siggen.js event.js scopetester.js

if /i "%1"=="dev" (
  set LOCK=_domainlock.dev.js
  set OUT=source45.dev.js
  set DOMAINS=csurgay.com,www.csurgay.com,localhost,127.0.0.1
  echo Building DEV test build ^(localhost allowed^) - do NOT publish source45.dev.js
) else (
  set LOCK=_domainlock.js
  set OUT=source45.js
  set DOMAINS=csurgay.com,www.csurgay.com
  echo Building PRODUCTION build - locked to csurgay.com
)

REM 1) Concatenate (domain lock first). copy /b needs '+' between names.
set LIST=%LOCK% %SRC%
set LIST=%LIST: = + %
copy /b %LIST% _bundle.tmp.js

REM 2) Obfuscate if Node.js (npx) is available; otherwise use the plain bundle.
where npx >nul 2>nul
if %errorlevel%==0 (
  echo Node found - obfuscating...
  call npx --yes javascript-obfuscator _bundle.tmp.js --output %OUT% ^
    --compact true ^
    --control-flow-flattening true --control-flow-flattening-threshold 0.75 ^
    --dead-code-injection true --dead-code-injection-threshold 0.3 ^
    --string-array true --string-array-encoding rc4 --string-array-threshold 0.8 ^
    --split-strings true --split-strings-chunk-length 8 ^
    --identifier-names-generator hexadecimal ^
    --self-defending true ^
    --domain-lock "%DOMAINS%" ^
    --domain-lock-redirect-url "https://csurgay.com/syggen" ^
    --reserved-names "^(init|start)$"
  del _bundle.tmp.js
  echo Done: obfuscated + domain-locked %OUT%
) else (
  echo Node/npx not found - building domain-locked-only %OUT%
  echo    ^(install Node.js from https://nodejs.org for full obfuscation^)
  move /y _bundle.tmp.js %OUT% >nul
  echo Done: %OUT%
)
