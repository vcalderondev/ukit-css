#!/usr/bin/env node
// Thin shim that delegates to the built CLI and propagates its exit code
// (important for `ukit-css validate`, which gates CI on unknown classes).
import("../dist/cli.js")
  .then(({ run }) => run(process.argv.slice(2)))
  .then((code) => {
    process.exitCode = code ?? 0
  })
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
