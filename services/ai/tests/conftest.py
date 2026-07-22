# conftest.py for pytest path adjustments
import sys
from pathlib import Path

# Add the repository root to sys.path so that imports like 'services.ai.*' work
repo_root = Path(__file__).resolve().parents[3]
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))
