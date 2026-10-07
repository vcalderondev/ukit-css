#!/usr/bin/env node
// =============================================================================
// RELEASE CONSISTENCY CHECK
// -----------------------------------------------------------------------------
// Guards against the class of problems that comes from a repository being
// reused across several package identities. This repo is a real example: it
// still carries tags from two earlier packages (`@vcalderondev/sass-ruleset`
// and `@vcalderondev/sasskit`) whose version numbers (up to 2.1.0) are HIGHER
// than the current one (1.0.2), while `main` only reaches 1.0.0 - 1.0.2.
//
// Checks:
//   1. src/core/version.ts agrees with package.json.
//   2. No git tag already exists for the version being released.
//   3. The version is greater than everything published on npm (this is what
//      catches a numbering restart, which npm cannot express).
//   4. Which tags belong to a DIFFERENT package name (foreign lineage).
//
// Usage:
//   node scripts/check-release.mjs            # report; foreign tags are warnings
//   node scripts/check-release.mjs --strict   # foreign tags become errors
//   node scripts/check-release.mjs --offline  # skip the npm registry query
// =============================================================================

import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const strict = process.argv.includes("--strict")
const offline = process.argv.includes("--offline")

const red = (s) => `\x1b[31m${s}\x1b[0m`
const yellow = (s) => `\x1b[33m${s}\x1b[0m`
const green = (s) => `\x1b[32m${s}\x1b[0m`
const dim = (s) => `\x1b[2m${s}\x1b[0m`

const errors = []
const warnings = []

// --- 1. version.ts === package.json -----------------------------------------

const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"))
const versionSource = readFileSync(path.join(root, "src/core/version.ts"), "utf8")
const versionMatch = versionSource.match(/VERSION\s*=\s*"([^"]+)"/)
if (!versionMatch) {
  errors.push("src/core/version.ts does not export a VERSION string")
} else if (versionMatch[1] !== pkg.version) {
  errors.push(
    `src/core/version.ts says ${versionMatch[1]} but package.json says ${pkg.version}`,
  )
}

// --- semver helpers (no dependencies) ---------------------------------------

function parseVersion(v) {
  const m = String(v).trim().replace(/^v/, "").match(/^(\d+)\.(\d+)\.(\d+)(?:-([\w.]+))?/)
  if (!m) return null
  return { major: +m[1], minor: +m[2], patch: +m[3], pre: m[4] ?? null }
}

/** -1 | 0 | 1, and null when either side is unparseable. */
function compareVersions(a, b) {
  const pa = parseVersion(a)
  const pb = parseVersion(b)
  if (!pa || !pb) return null
  for (const key of ["major", "minor", "patch"]) {
    if (pa[key] !== pb[key]) return pa[key] < pb[key] ? -1 : 1
  }
  if (pa.pre === pb.pre) return 0
  if (pa.pre === null) return 1 // a release outranks a prerelease
  if (pb.pre === null) return -1
  return pa.pre < pb.pre ? -1 : 1
}

// --- 2. no tag for the version being released -------------------------------

function git(args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim()
  } catch {
    return null
  }
}

const currentTag = `v${pkg.version}`
const tagList = (git(["tag", "-l"]) ?? "").split("\n").filter(Boolean)

// --- 4. foreign tags (different package name in their package.json) ---------

const foreign = []
for (const tag of tagList) {
  // Tags namespaced under `legacy/` are preserved history from an earlier
  // package identity. They are deliberately kept out of the version space
  // (which is the whole point of the prefix), so they are not a problem.
  if (tag.startsWith("legacy/")) continue
  const raw = git(["show", `${tag}:package.json`])
  if (!raw) continue
  try {
    const tagged = JSON.parse(raw)
    if (tagged.name && tagged.name !== pkg.name) {
      foreign.push({ tag, name: tagged.name, version: tagged.version ?? "?" })
    }
  } catch {
    /* not a package.json we can read */
  }
}

if (tagList.includes(currentTag)) {
  const taggedName = (() => {
    const raw = git(["show", `${currentTag}:package.json`])
    if (!raw) return null
    try {
      return JSON.parse(raw).name
    } catch {
      return null
    }
  })()
  if (taggedName === pkg.name) {
    // Always a warning, never an error: in the normal flow the tag is created
    // *with* the version bump, so the tag exists from the very first release.
    // What actually prevents a double publish is the "already on the registry"
    // check below (and the skip step in the publish workflow).
    warnings.push(
      `git tag ${currentTag} already exists for ${pkg.name}. If this version is also on npm, ` +
        `bump package.json and src/core/version.ts before releasing anything new.`,
    )
  } else {
    warnings.push(
      `git tag ${currentTag} exists but belongs to ${taggedName ?? "another package"} — a new tag cannot be created with that name.`,
    )
  }
}

// --- 3. monotonic against the npm registry ----------------------------------

let published = []
if (!offline) {
  try {
    const out = execFileSync(
      "npm",
      ["view", pkg.name, "versions", "--json"],
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    )
    const parsed = JSON.parse(out)
    published = Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    warnings.push(`could not query the npm registry for ${pkg.name} (offline?)`)
  }
}

if (published.length > 0) {
  const sorted = [...published].sort((a, b) => compareVersions(a, b) ?? 0)
  const newest = sorted[sorted.length - 1]
  const cmp = compareVersions(pkg.version, newest)
  if (cmp === null) {
    warnings.push(`could not compare ${pkg.version} with published ${newest}`)
  } else if (cmp < 0) {
    errors.push(
      `version ${pkg.version} is LOWER than the newest published version ${newest}. ` +
        `npm resolves "latest" inconsistently in this situation — publish a higher version instead.`,
    )
  } else if (cmp === 0) {
    warnings.push(`${pkg.version} is already published on npm (the publish workflow will skip it)`)
  }
}

// --- report -----------------------------------------------------------------

console.log(`${dim("package:")} ${pkg.name} ${dim("·")} ${dim("version:")} ${pkg.version}`)
console.log(
  `${dim("tags:")} ${tagList.length} total, ${foreign.length} from other package identities`,
)
if (published.length > 0) {
  console.log(`${dim("published on npm:")} ${published.join(", ")}`)
}
console.log("")

if (foreign.length > 0) {
  const grouped = new Map()
  for (const f of foreign) {
    if (!grouped.has(f.name)) grouped.set(f.name, [])
    grouped.get(f.name).push(f.tag)
  }
  console.log(
    yellow(
      `⚠ ${foreign.length} tag(s) belong to a different package name and are unrelated to this history:`,
    ),
  )
  for (const [name, tags] of grouped) {
    console.log(`    ${name} → ${tags.sort().join(", ")}`)
  }
  console.log(
    dim(
      "  They cannot be confused with a release of this package, but they DO block reusing\n" +
        "  those numbers later (e.g. `git tag v2.0.0` already exists). To preserve them under a\n" +
        "  namespace and free the numbers:\n" +
        "    for t in " +
          foreign.map((f) => f.tag).join(" ") +
          "; do git tag \"legacy/$t\" \"$t\"; done\n" +
        "    git push origin --tags\n" +
        "    git push origin --delete " +
          foreign.map((f) => f.tag).join(" "),
    ),
  )
  console.log("")
  if (strict) {
    errors.push(`${foreign.length} foreign tag(s) found (--strict)`)
  }
}

for (const w of warnings) console.log(yellow(`⚠ ${w}`))
for (const e of errors) console.log(red(`✗ ${e}`))

if (errors.length === 0) {
  console.log(green("✓ release metadata is consistent"))
  process.exit(0)
}
console.log("")
console.log(red(`${errors.length} problem(s) must be fixed before releasing.`))
process.exit(1)
