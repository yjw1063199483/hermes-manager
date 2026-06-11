@echo off
cd /d D:\code\hermes-manager\backend
start /B python -m uvicorn app.main:app --host 127.0.0.1 --port 9527 > %USERPROFILE%\AppData\Local\hermes\manager.log 2>&1
