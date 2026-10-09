"""Run every reference solution's built-in tests: python3 scripts/test_solutions.py

DSA: data/dsa/<id>.py. LLD: data/lld/<id>.py, plus each <id>.flawed.py must compile.
Every solution ends with an `if __name__ == "__main__":` block of asserts. Fails on a failed
test, a listed file that is missing, or a file on disk that no problem references.
"""
import json
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
failures = []
counts = {}

for segment in ("dsa", "lld"):
    problems = json.loads((root / "data" / f"{segment}.json").read_text())["problems"]
    expected = {root / p["solution_file"] for p in problems if p.get("solution_file")}
    flawed = {root / p["ai_exercise"]["flawed_file"] for p in problems if p.get("ai_exercise")}
    on_disk = set((root / "data" / segment).glob("*.py"))
    failures += [f"missing file: {p.relative_to(root)}" for p in sorted((expected | flawed) - on_disk)]
    failures += [f"no problem references: {p.relative_to(root)}" for p in sorted(on_disk - expected - flawed)]
    for path in sorted(expected & on_disk):
        if 'if __name__ == "__main__":' not in path.read_text():
            failures.append(f"no test block: {path.name}")
            continue
        run = subprocess.run([sys.executable, "-I", str(path)], capture_output=True, text=True, timeout=60)
        if run.returncode:
            failures.append(f"{path.name}: {run.stderr.strip().splitlines()[-1] if run.stderr else 'failed'}")
    for path in sorted(flawed & on_disk):
        try:
            compile(path.read_text(), str(path), "exec")  # syntax check, writes nothing
        except SyntaxError as err:
            failures.append(f"{path.name} does not compile: {err}")
    counts[segment] = (len(expected), len(flawed))

if failures:
    print("solution tests failed:\n  " + "\n  ".join(failures))
    sys.exit(1)
print(f"solution tests passed: {counts['dsa'][0]} DSA, {counts['lld'][0]} LLD, {counts['lld'][1]} flawed LLD files compile")
