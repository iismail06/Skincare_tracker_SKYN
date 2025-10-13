# Python Validation

This section documents Python code validation, primarily linting with flake8, organized similarly to the HTML validation docs. Use it to capture both past and current errors, resolutions, and final passes with screenshots.

## PEP8 Cleanup Summary (Oct 13, 2025)

All Python files were cleaned and formatted to follow PEP8 style guidelines for better readability and maintainability.

- ✅ Line length fixed: All lines were shortened to stay under 79 characters (E501 errors resolved).
- ✅ Indentation corrected: Adjusted over-indented continuation lines (E127 errors fixed).
- ✅ Blank lines standardized: Improved spacing for functions and imports.
- ✅ Consistency ensured: Cleaned up long function calls and improved readability without changing functionality.
- ✅ Token and syntax issues resolved: Fixed any accidental formatting or token errors during cleanup.

## Validation Process

We validate Python code quality and style using:

- flake8 (PEP 8 + pyflakes)
- Optional: isort (imports), black (formatting) — if used, note results here

Typical workflow:

1. Run flake8 locally or in CI to list issues
2. Capture a screenshot of errors for each app/file (save under the appropriate app/errors folder)
3. Fix issues, re-run flake8
4. Capture a screenshot showing a clean result (save under the app/passes folder)
5. Update the tables below and/or the per-app pages with Issue, Resolution, and Screenshot links

## Organization

- `users/` — Users app Python validation (errors, passes, README)
- `routines/` — Routines app Python validation (errors, passes, README)
- `products/` — Products app Python validation (errors, passes, README)

Each app directory contains:

- `errors/` — screenshots showing lint errors before fixes
- `passes/` — screenshots showing successful validation after fixes
- `README.md` — per-app tables (errors and passes)

## Validation Results Summary

Add a row per file/module or a grouped row per app. Keep it high-level and link to the per-app pages for the full detail.

| App | File/Module | Status | Issues Found | Resolution | Screenshot |
|-----|-------------|--------|--------------|------------|------------|
| Users | users/views.py | ❌ → ✅ | Example: F401 unused import; E302 expected 2 blank lines | Removed unused imports; added required blank lines | Before · After |
| Routines | routines/models.py | ❌ → ✅ | Example: E501 line too long; W293 blank line with whitespace | Broke long lines; trimmed trailing whitespace | Before · After |
| Products | products/forms.py | ❌ → ✅ | Example: F841 local variable assigned but never used | Removed unused variable; simplified logic | Before · After |

For detailed results and more screenshots, see the per-app pages:

- [Users app Python validation](users/README.md)
- [Routines app Python validation](routines/README.md)
- [Products app Python validation](products/README.md)

## Common Issues and Fixes

These are common flake8 issues you might encounter and typical fixes. Replace with your actual cases as needed.

- F401 unused import: Remove the import or use it
- F841 local variable assigned to but never used: Delete or use the variable
- E302 expected 2 blank lines before top-level definitions: Add blank lines
- E305 expected 2 blank lines after class or function definition: Add blank lines
- E501 line too long: Wrap or refactor long lines
- W291/W293 trailing or blank line whitespace: Trim spaces
- E231 missing whitespace after ',', ':': Add spaces where appropriate
- E722 do not use bare except: Catch specific exceptions
- W605 invalid escape sequence in string: Use raw strings or escape properly
