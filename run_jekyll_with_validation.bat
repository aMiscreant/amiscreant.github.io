@echo off
REM Activate virtual environment
call venv\Scripts\activate

REM Run validation
python scripts/validate_content.py

REM Serve Jekyll
bundle exec jekyll serve
