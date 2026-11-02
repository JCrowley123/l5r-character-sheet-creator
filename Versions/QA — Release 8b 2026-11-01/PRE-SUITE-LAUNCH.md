# Release 8b — failed launch before suite execution

At 23:08 UTC on 1 November 2026, the full-run launcher stopped at its initial `recombine.py --verify` command. That command writes the HTML before checking its hash. Windows rejected the truncating write with `OSError: [Errno 22] Invalid argument`. No candidate or retained suite leaf ran; the recorded `cases` list was empty and there was no `01-full.log` or leaf folder.

The candidate remained 17,484,443 bytes with SHA-256 `1eb9e017636829a941a8d9b0916fc2b0d0c81eefc97e2b8fd7d222f4ea02f322`. Reads and a non-truncating Python write-open succeeded, as did equivalent UTF-8 writes to a QA probe. The failing-test investigator established that the exception path exactly matched the valid 168-character builder output path, and a read-only Windows Restart Manager query found no current file holder. The precise historical Windows cause is unproven; no lock or load explanation is asserted as fact.

The QA runner now copies the source tree to an isolated temporary directory, runs the unchanged builder with `--verify` there, and compares its output byte for byte with the frozen candidate. It also asserts the pinned candidate hash. This preserves all build assertions and avoids rewriting the candidate. The targeted scratch rebuild passed before the suite started. Production code did not change.

The continuation guard accepts only this exact recorded pre-suite state and refuses any suite log, leaf directory, completed case, changed candidate or different failure. Eight cases were pinned before execution: one accepted state and seven rejected states; all passed. A separate one-use marker prevents repeated continuation. The first actual suite execution began at 23:11 UTC; neither full pass may be retried after a leaf starts.

Evidence retained:

- `qa/full-launch.log` and `qa/full-launched.txt`: original launch and stop.
- `qa/final-run-1/launch-failure.json` and `00-build-launch-failure.log`: immutable copies of the failed pre-suite state.
- `qa/pre-suite-guard-checks.json` and `.log`: eight guard cases and exact scratch build.
- `qa/pre-suite-continuation-launched.txt` and `full-continuation.log`: one-use continuation.

Report the result honestly: there was a failed launch before checks, so the whole qualification was not an uninterrupted first-time success. The full suites' first actual executions are reported separately in the handover; no failed suite was rerun to obtain a pass.
