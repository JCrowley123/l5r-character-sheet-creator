# First full-run failure

First candidate attempt failed:6,150/6,153 executed checks, expected6,175. The one failing leaf was Heart of Vengeance:66/69 rather than91. New Taint/Honour providers broke its old single-provider assumption. Broad label locators matched the additional Honour option, causing section exceptions and22 skipped assertions. All139 other leaves passed. This was not a load timeout and is not a first-time full-suite pass.

The test now selects Heart of Vengeance labels by their stable provider key and conditionally accepts the two new registered providers only when enabled. Every original assertion, expected dice result, geometry tolerance and count remains. Targeted candidate91/91 and actualmain91/91 passed. The failed full-run evidence is preserved unchanged. No production code changed; no second reviewer or failure investigator used because the cause is explicit in the log.
