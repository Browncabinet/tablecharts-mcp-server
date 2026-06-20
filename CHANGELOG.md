# Changelog

All notable changes to this project will be documented in this file.
## [0.1.5] - 2026-06-20
### Changed
- Expanded published tarball to include CHANGELOG.md, server.json, glama.json, Dockerfile, and assets/ for better Glama.ai grading.

## [0.1.4] - 2026-06-19

### Fixed
- Republish with `server.json`, `CHANGELOG.md`, `Dockerfile`, and `assets/` (logo + 3 chart screenshots) actually included in the published tarball. Versions 0.1.1–0.1.3 were tagged but never reached npm.


## [0.1.3] - 2026-06-19

### Added
- Three example chart screenshots (bar, line, donut) in `assets/` and surfaced via `glama.json` `screenshots` and the README Examples section, so the Glama listing and GitHub repo show real previews.


## [0.1.2] - 2026-06-19

### Fixed
- **Critical:** point the client at the real TableCharts API host. `0.1.0` and `0.1.1` POSTed to `https://tablecharts.co/api/generate-dashboard`, which does not exist — the marketing site returned its SPA `index.html` with status 200, so every tool call surfaced raw HTML instead of a dashboard. The default `TABLECHARTS_API_BASE` is now the Supabase Edge Functions origin and the path is `/generate-dashboard`.
- Stop treating non-JSON 200 responses as success — return a clear error instead of forwarding HTML to the model.

## [0.1.1] - 2026-06-19

### Fixed
- Fixed `glama.json` schema for full Glama compatibility
- Added proper Glama release and build configuration

### Changed
- Improved README with badges and installation guide
- Better environment variable documentation

## [0.1.0] - 2026-06-18

### Added
- Initial public release of TableCharts MCP Server
- Support for JSON, CSV, and URL → hosted interactive dashboards
- 6+ chart types with full interactivity
- Claude Desktop, Cursor, and VS Code configuration examples
