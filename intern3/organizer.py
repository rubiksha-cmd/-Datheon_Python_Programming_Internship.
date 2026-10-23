#!/usr/bin/env python3
"""
Autonomous desktop automation utility that organizes cluttered directories
(such as a Downloads folder) based on file extensions.

Usage:
    python organizer.py [path]

If no path is provided, the script defaults to the system Downloads folder,
falling back to the current working directory.

Cross-platform: Windows, macOS, Linux.
"""

from __future__ import annotations

import argparse
import os
import shutil
import sys
from pathlib import Path
from typing import Dict, List, Tuple


# ---------------------------------------------------------------------------
# Extension → category mapping
# ---------------------------------------------------------------------------

CATEGORY_MAP: Dict[str, List[str]] = {
    "Documents": [".pdf", ".docx", ".doc", ".txt", ".xlsx", ".pptx", ".csv", ".odt"],
    "Images":    [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".ico"],
    "Videos":    [".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv"],
    "Archives":  [".zip", ".tar", ".gz", ".rar", ".7z"],
    "Code":      [".py", ".js", ".ts", ".html", ".css", ".json", ".cpp", ".c", ".java"],
}

# Flatten the mapping for O(1) lookup: extension → category name.
EXTENSION_TO_CATEGORY: Dict[str, str] = {
    ext: category for category, exts in CATEGORY_MAP.items() for ext in exts
}

# The name of this script — it must never be moved.
SCRIPT_NAME: str = os.path.basename(__file__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def resolve_target_directory(user_path: str | None) -> Path:
    """Determine the directory to organize.

    Priority order:
      1. Explicit path supplied via the command line.
      2. System Downloads folder.
      3. Current working directory.
    """
    if user_path:
        target = Path(user_path).expanduser().resolve()
    else:
        downloads = Path.home() / "Downloads"
        target = downloads if downloads.is_dir() else Path.cwd().resolve()

    if not target.is_dir():
        print(f"Error: '{target}' is not a valid directory.")
        sys.exit(1)

    return target


def get_category(file_path: Path) -> str:
    """Return the category name for a file, defaulting to 'Others'."""
    ext = file_path.suffix.lower()
    return EXTENSION_TO_CATEGORY.get(ext, "Others")


def should_skip(entry: Path) -> bool:
    """Return True for directories, the script itself, and hidden/system files."""
    if entry.is_dir():
        return True
    name = entry.name
    if name == SCRIPT_NAME:
        return True
    # Skip hidden files (Unix) and system files (Windows / macOS temp).
    if name.startswith(".") or name.startswith("~"):
        return True
    return False


def unique_destination(dest_dir: Path, file_path: Path) -> Path:
    """Return a destination path that won't overwrite an existing file.

    If ``dest_dir / file_path.name`` already exists, an incremental numeric
    suffix is appended before the suffix (e.g. ``report.pdf`` → ``report_1.pdf``).
    """
    candidate = dest_dir / file_path.name
    if not candidate.exists():
        return candidate

    stem = file_path.stem
    suffix = file_path.suffix
    counter = 1
    while True:
        candidate = dest_dir / f"{stem}_{counter}{suffix}"
        if not candidate.exists():
            return candidate
        counter += 1


# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------

def organize_directory(target: Path) -> Tuple[int, Dict[str, int], int]:
    """Organize *target* by moving files into category subfolders.

    Returns:
        (total_scanned, per_category_counts, error_count)
    """
    total_scanned = 0
    errors = 0
    per_category: Dict[str, int] = {}

    for entry in target.iterdir():
        if not entry.is_file():
            continue

        if should_skip(entry):
            continue

        total_scanned += 1
        category = get_category(entry)
        dest_dir = target / category

        try:
            # Create the category folder only when it's needed.
            dest_dir.mkdir(exist_ok=True)
            dest_path = unique_destination(dest_dir, entry)
            shutil.move(str(entry), str(dest_path))

            per_category[category] = per_category.get(category, 0) + 1
        except PermissionError:
            print(f"  [WARN] Permission denied: {entry.name}")
            errors += 1
        except FileExistsError:
            print(f"  [WARN] File already exists after collision check: {entry.name}")
            errors += 1
        except OSError as exc:
            print(f"  [WARN] OS error moving '{entry.name}': {exc}")
            errors += 1

    return total_scanned, per_category, errors


# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

def print_summary(
    target: Path,
    total_scanned: int,
    per_category: Dict[str, int],
    errors: int,
) -> None:
    """Print a formatted summary table of the run."""
    moved = sum(per_category.values())
    width = 14

    print()
    print("=" * 46)
    print("  DIRECTORY ORGANIZATION SUMMARY")
    print("=" * 46)
    print(f"  Target directory : {target}")
    print(f"  Total files scanned : {total_scanned}")
    print("-" * 46)

    if per_category:
        print(f"  {'Category':<{width}}  Files moved")
        print("-" * 46)
        for category in sorted(per_category):
            print(f"  {category:<{width}}  {per_category[category]}")
    else:
        print("  No files were moved.")

    print("-" * 46)
    print(f"  Total files moved : {moved}")
    print(f"  Errors / skipped  : {errors}")
    print("=" * 46)
    print()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    """Parse arguments and run the organizer."""
    parser = argparse.ArgumentParser(
        description="Organize a cluttered directory by file extension.",
        epilog="Example: python organizer.py ~/Downloads",
    )
    parser.add_argument(
        "path",
        nargs="?",
        default=None,
        help="Directory to organize (default: system Downloads or cwd).",
    )
    args = parser.parse_args()

    target = resolve_target_directory(args.path)
    print(f"Organizing: {target}")

    total_scanned, per_category, errors = organize_directory(target)
    print_summary(target, total_scanned, per_category, errors)


if __name__ == "__main__":
    main()
