@echo off
REM Doble clic para abrir Ruta Lectora en el navegador (modo desarrollo).
cd /d "%~dp0"
if not exist node_modules call npm.cmd install
start "" http://localhost:5173
call npm.cmd run dev
