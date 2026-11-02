"""Permit one continuation only when build verification failed before any suite leaf."""
import json
from pathlib import Path

FROZEN = '1eb9e017636829a941a8d9b0916fc2b0d0c81eefc97e2b8fd7d222f4ea02f322'

def require_unstarted_suite(folder):
    folder = Path(folder)
    assert folder.is_dir() and not folder.is_symlink(), 'Expected original pre-suite evidence'
    assert {p.name for p in folder.iterdir()} == {'00-build.log', 'summary.json'}, 'Suite evidence exists; no continuation allowed'
    previous = json.loads((folder / 'summary.json').read_text(encoding='utf-8'))
    assert previous.get('cases') == [] and previous.get('passed') is False, 'A suite already ran or state is ambiguous'
    assert previous.get('source_sha256') == FROZEN and previous.get('source_bytes') == 17484443, 'Unexpected candidate'
    assert previous.get('error', '').startswith("('00-build', 1,"), 'Only the recorded initial build failure is recoverable'
    log = (folder / '00-build.log').read_text(encoding='utf-8')
    assert 'OSError: [Errno 22] Invalid argument:' in log and 'recombine.py' in log, 'Unexpected failure'
    return previous
