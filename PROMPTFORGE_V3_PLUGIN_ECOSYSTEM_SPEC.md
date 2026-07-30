# PromptForge v3 - Plugin & Extension Ecosystem Specification

## 1. Plugin Architecture
PromptForge v3 introduces a modular, decentralized plugin architecture designed to extend the platform's core capabilities without modifying the internal engine. 
- **Core Host**: PromptForge acts as the host environment, exposing controlled integration points via a stable API.
- **Plugin Tiers**:
  - *Core Plugins*: First-party extensions maintained by the PromptForge team (e.g., standard GitHub integration).
  - *Official Plugins*: Verified extensions from trusted partners.
  - *Community Plugins*: Open-source extensions created by independent developers.
  - *Enterprise Plugins*: Proprietary extensions restricted to specific organizational domains.
- **Manifest**: Every plugin must include a `promptforge.json` manifest defining: Name, ID, Version, Author, Description, Permissions, Capabilities, Dependencies, and Compatibility.

## 2. Plugin SDK
The SDK is the developer toolkit for interacting with PromptForge.
- **TypeScript First**: The SDK provides strongly typed interfaces and utilities for seamless integration.
- **Core Modules**:
  - `promptforge/core`: Base plugin lifecycle and initialization.
  - `promptforge/ui`: Components and hooks for registering UI elements.
  - `promptforge/ai`: Interfaces for defining custom agents or connecting new LLM providers.
  - `promptforge/events`: Subscription methods for the event bus.

## 3. Extension API
Defines how plugins interact with the PromptForge UI and engine.
- **UI Extensions**: Register custom panels, command palette entries, context menu actions, and settings pages.
- **Engine Extensions**: 
  - Register new AI Agents to the Multi-Agent Swarm.
  - Add custom Validators to the validation pipeline.
  - Add Exporters/Importers for new file formats (e.g., Jira, Notion).
  - Define custom Prompt Compilers.

## 4. Plugin Registry
The centralized service managing the catalog of all available plugins.
- **Database**: Stores plugin metadata, versions, and binaries.
- **Discovery**: Provides search, categorization (e.g., Security, UI, Exporters), and featured lists.
- **Compatibility Matrix**: Automatically cross-references the user's PromptForge version against the plugin's `engines` requirements in the manifest.

## 5. Marketplace
The user-facing storefront for discovering and installing plugins.
- **Listings**: Includes Screenshots, Documentation, Release Notes, and License info.
- **Social Proof**: Ratings, Reviews, Download metrics, and a "Verified Publisher" badge system.
- **One-Click Install**: Direct installation from the UI, pulling the latest compatible version from the Registry.

## 6. Permission System
A granular, explicit permission model to protect user data.
- **Manifest Declaration**: Plugins must declare required permissions (e.g., `workspace:read`, `prompt:write`, `network:fetch`, `clipboard:write`).
- **User Consent**: Upon installation, users are presented with a consent screen detailing the requested permissions. Sensitive permissions (like network access) require explicit opt-in.
- **Runtime Enforcement**: The Sandbox dynamically blocks API calls that lack the appropriate granted permission.

## 7. Sandboxing
Security boundary ensuring plugins cannot compromise the host.
- **Execution Environment**: Plugins run in an isolated Web Worker (browser) or secure v8 isolate (desktop/server).
- **Restrictions**: 
  - No direct DOM access (UI changes go through the Extension API).
  - Intercepted network requests (fetch is proxied and checked against permissions).
  - Resource limits (CPU execution time limits, memory bounds) to prevent lockups.

## 8. Event System
An asynchronous pub/sub event bus enabling reactive plugin behavior.
- **Core Events**: `ProjectCreated`, `ProjectOpened`, `PromptChanged`, `CompileStarted`, `CompileFinished`, `ValidationStarted`, `ValidationFinished`, `ExportCompleted`.
- **Custom Events**: Plugins can emit custom events for inter-plugin communication.
- **Subscription**: Plugins subscribe via `promptforge.events.on('EventName', callback)`.

## 9. Lifecycle
The standardized state machine for a plugin's existence.
1. **Install**: Fetched and verified by the host.
2. **Enable**: User activates the plugin.
3. **Initialize**: `activate(context)` hook is called; plugin registers commands and listeners.
4. **Run**: Active in the workspace, responding to events and user interactions.
5. **Suspend**: Temporarily halted to free resources (if inactive).
6. **Disable**: `deactivate()` hook is called; listeners are purged.
7. **Update**: Replaced with a new version, triggering re-initialization.
8. **Uninstall**: Completely removed from the local environment.

## 10. Version Management
Ensuring stability across updates.
- **Semantic Versioning (SemVer)**: Enforced for all published plugins.
- **Dependency Resolution**: Automatically installs required companion plugins.
- **Rollback**: Users can revert to previous versions if an update introduces instability.
- **Deprecation**: Graceful warnings when a plugin relies on deprecated API methods.

## 11. Error Isolation
Fault tolerance to ensure PromptForge remains stable.
- **Crash Handling**: If a plugin worker throws an uncaught exception, the worker is terminated. PromptForge does not crash.
- **Graceful Degradation**: UI panels provided by the crashed plugin are replaced with a "Plugin Failed" placeholder.
- **Logging & Notification**: The error stack is logged to a sandboxed console, and the user is notified with an option to restart or disable the plugin.

## 12. Security Model
Defense-in-depth approach for the ecosystem.
- **Static Analysis**: All submitted plugins undergo automated static analysis before being listed in the Marketplace.
- **Code Signing**: Official plugins are cryptographically signed to prevent tampering.
- **Data Exfiltration Prevention**: Network requests are logged and restricted to domains declared in the manifest.

## 13. Developer Experience
Tools to foster a thriving developer community.
- **CLI**: `promptforge-cli` for scaffolding, building, and publishing plugins (`pf create`, `pf publish`).
- **Starter Kits**: Boilerplate templates for common plugin types (e.g., "New Exporter Template").
- **Local Testing**: A developer mode that hot-reloads plugins directly in the PromptForge UI.
- **Documentation**: Comprehensive API references, tutorials, and best practices portal.

## 14. Future Scalability
- **Language Server Protocol (LSP)**: Supporting LSP extensions for advanced syntax highlighting and autocomplete.
- **Inter-Plugin Dependencies**: Allowing plugins to expose APIs for other plugins to consume.
- **Headless Execution**: Supporting plugin execution in a CI/CD pipeline via the PromptForge CLI.

## 15. Sequence Diagrams
*Example: Plugin Initialization*
`Host` -> reads `Manifest` -> requests `Permissions` from `User` -> spawns `Sandbox` -> loads `Plugin Code` -> calls `activate()` -> `Plugin` registers `Command` via `Extension API`.

## 16. Component Diagrams
`PromptForge Core` <--> `Extension API Bridge` <--> `Secure Sandbox` [ `Plugin Logic` <--> `Event Listener` ].
`UI Host` <--> `Shadow DOM Container` (renders Plugin UI securely).

## 17. Data Flow
`User Action` -> `Host Event Bus` -> `Sandbox Proxy` -> `Plugin Handler`.
`Plugin Action` -> `Extension API Request` -> `Permission Check` -> `Host Execution` -> `Result to Plugin`.

## 18. Best Practices
- **Lazy Loading**: Only load heavy dependencies when the plugin's specific command is invoked.
- **State Management**: Do not rely on persistent in-memory state; use the provided Key-Value storage API.
- **Non-Blocking**: Perform heavy computation asynchronously to avoid stalling the Sandbox thread.
- **Minimal Permissions**: Request only the permissions absolutely necessary for the core functionality.
