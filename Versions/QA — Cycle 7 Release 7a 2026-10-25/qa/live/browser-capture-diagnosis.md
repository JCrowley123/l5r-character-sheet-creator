# Browser capture adjustment

The first real-URL smoke run returned HTTP 200 but could not read the 17.3 MB response through Chrome's inspector: Network.getResponseBody reported eviction from its cache. No app defect was established. The verifier now requests a 32 MiB per-resource / 64 MiB total inspector buffer before navigation; all nine assertions remain unchanged. The failed attempt is retained. Application bytes were not changed.

A second attempt still read the body through Playwright's different inspector session. The successful final version reads the original navigation response through the same CDP session configured with a 128 MiB per-resource / 256 MiB total buffer. All nine original checks pass, including offline reload. Both initial attempts remain on disk.
