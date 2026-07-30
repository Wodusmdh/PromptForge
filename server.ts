import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createApiRouter } from "./src/api/routes";

dotenv.config();

const app = express();
const GEMINI_MODEL = process.env.PROMPTFORGE_GEMINI_MODEL || "gemini-3.6-flash";
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use("/api/v1", createApiRouter());

// Initialize Gemini SDK with User-Agent header for telemetry
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Pre-built prompt engineering templates
const TEMPLATES = [
  {
    id: "saas-analytics",
    title: "Multi-tenant SaaS Analytics Platform",
    category: "SaaS",
    description: "Enterprise analytics dashboard with team permissions, custom chart widgets, Stripe billing, and audit logs.",
    complexity: "Large",
    stack: "React 19 + Express + Tailwind CSS v4",
    architectureStyle: "Modular Monolith",
    uiStyle: "Modern Minimalist",
    dbType: "PostgreSQL",
    securityLevel: "Enterprise PCI/HIPAA",
    idea: "A multi-tenant SaaS web app for product analytics. Includes team workspaces, role-based access control (Admin, Editor, Viewer), custom chart widgets with Recharts, Stripe subscription tier management, API key management for data ingestion, and immutable audit logs.",
  },
  {
    id: "healthcare-portal",
    title: "Telemedicine Doctor Appointment Booking",
    category: "Healthcare",
    description: "HIPAA-compliant doctor booking, video consultation launcher, medical records history, and patient triage.",
    complexity: "Large",
    stack: "React 19 + Express + Tailwind CSS v4",
    architectureStyle: "Clean Architecture",
    uiStyle: "Medical / Healthcare Clean",
    dbType: "PostgreSQL",
    securityLevel: "Enterprise PCI/HIPAA",
    idea: "A HIPAA-aligned telehealth platform connecting patients with specialist doctors. Features real-time slot selection, WebRTC video consultation launcher, encrypted medical records storage, triage symptom checker, and prescription PDF generation.",
  },
  {
    id: "fintech-dashboard",
    title: "Crypto & Wealth Asset Management",
    category: "FinTech",
    description: "Real-time portfolio tracking, multi-currency conversion, transaction history export, and risk analytics.",
    complexity: "Medium",
    stack: "React 19 + Express + Tailwind CSS v4",
    architectureStyle: "Modular Monolith",
    uiStyle: "Dark Luxury Studio",
    dbType: "PostgreSQL",
    securityLevel: "Enterprise PCI/HIPAA",
    idea: "A fintech dashboard for wealth managers to monitor multi-asset portfolios, cryptocurrency holdings, forex conversions, automatic profit/loss analytics, instant CSV/PDF export, and multi-factor authentication security.",
  },
  {
    id: "ai-content-studio",
    title: "AI Workspace & Workflow Orchestrator",
    category: "AI Application",
    description: "Multi-model prompt playground, canvas document editor, prompt versioning, and export pipeline.",
    complexity: "Medium",
    stack: "React 19 + Express + Tailwind CSS v4",
    architectureStyle: "Modular Monolith",
    uiStyle: "Dark Luxury Studio",
    dbType: "Firestore",
    securityLevel: "Standard",
    idea: "An AI creation studio allowing creators to run multi-step AI pipelines (text generation, image prompt generation, audio scripts), save prompt versions, collaborate in a split-screen canvas editor, and export formatted Markdown or PDF ebooks.",
  },
  {
    id: "ecommerce-marketplace",
    title: "Multi-vendor Artisanal E-Commerce",
    category: "E-Commerce",
    description: "Vendor store fronts, real-time cart/checkout, inventory tracking, order fulfillment status, and reviews.",
    complexity: "Large",
    stack: "React 19 + Express + Tailwind CSS v4",
    architectureStyle: "Modular Monolith",
    uiStyle: "Modern Minimalist",
    dbType: "PostgreSQL",
    securityLevel: "Standard",
    idea: "An online marketplace where independent artisans register vendor shops, upload products with variant pricing, manage orders, and buyers can browse by category, filter by price/rating, add to cart, checkout via Stripe, and leave verified reviews.",
  },
  {
    id: "dev-kanban-tool",
    title: "Agile Project Kanban & Issue Tracker",
    category: "Developer Tool",
    description: "Drag-and-drop boards, sprint planning, GitHub webhook integration, activity feed, and milestone tracking.",
    complexity: "Medium",
    stack: "React 19 + Express + Tailwind CSS v4",
    architectureStyle: "Modular Monolith",
    uiStyle: "Fintech Clean",
    dbType: "PostgreSQL",
    securityLevel: "Standard",
    idea: "An developer issue tracking tool featuring interactive Kanban boards with drag-and-drop cards, custom issue tags, story point estimation, sprint burndown charts, Markdown comments, and GitHub pull request status webhooks.",
  },
];

// PROMPTFORGE AI v2.0 System Prompt Specification
const PROMPTFORGE_SYSTEM_PROMPT = `
You are PromptForge AI v2.0, an elite AI Prompt Engineering System and Software Product Architect.
Your job is to transform raw software ideas and visual reference inputs into complete, production-ready, zero-ambiguity prompts for AI Coding Assistants (e.g. Gemini AI Studio, Cursor, Claude, Bolt, v0, Windsurf).

You MUST strictly enforce the PROMPTFORGE AI v2.0 GOLDEN RULES & ALL ENGINES:
1. Requirement Engine: Business, technical, user goals, success metrics, assumptions, functional & non-functional requirements.
2. Software Architecture Engine: Layered structure, state management, routing, backend layers, data flow, folder structure file tree.
3. Database Engine: Detailed schema with normalized entities, field data types, PK/FK, relationships (1:1, 1:N, N:M), indexes, constraints, validations.
4. API Engine: REST/GraphQL endpoints with URL, HTTP method, authentication requirements, request/response payload schemas, status codes, validation rules.
5. UI/UX & Design System Engine: Color tokens (primary, background, surface, border, accent, text), typography scale, spacing rules, component catalog, page layouts, responsive breakpoints, WCAG accessibility.
6. Security Engine: Auth matrix (roles & permissions), attack mitigations (SQLi, XSS, CSRF, CORS, Rate limiting), password hashing, audit logs.
7. DevOps & Quality Engine: Performance caching, error handling matrix, CI/CD checklist, logging/monitoring.
8. Testing & Edge Case Engine: Mandatory unit, integration, E2E, security, accessibility, performance, and API tests. Detailed test steps, expected results, edge cases.
9. Error Handling & Recovery Engine: User messages, developer log patterns, retry strategies, and fallback strategies for all validation, server, network, and auth errors.
10. Documentation Engine: Installation guide, API docs, DB guide, deployment guide, environment variable declarations, troubleshooting guide, known limitations.
11. AI Coding Assistant Directives: Explicit instructions for the target coding AI ("Think before coding", "Build architecture first", "Never silently remove requested features", "Write modular, scalable, production-ready TypeScript code").
12. Quality Assurance & Self Validation Engine: Verify no missing screen, API, database table, permission, validation, or error handling.
13. Visual Design Analysis Engine (Part 9): When reference images (UI screenshots, wireframes, sketches, mockups, Figma exports, ERD/architecture diagrams) exist, perform visual extraction (overall style, layout, visual hierarchy, spacing, typography, color palette, component placement, animations, accessibility, UX quality). Extract design characteristics without making exact copyright copies; convert design principles into improved, responsive, accessible, production-grade UI specifications.
14. Advanced Input & Intelligent Analysis Engine (Part 10):
    - Reference Website Analysis Engine: Extract design style, navigation, visual hierarchy, form/table/card design, responsiveness, strengths/weaknesses from website URLs or references. Produce original, improved designs inspired by best ideas without copyright copying.
    - Existing Project Analysis Engine: Analyze source code/ZIPs/repos to identify tech stack, architecture, tech debt, code smells, maintainability, and security. Suggest refactoring without unnecessary rewrites.
    - AI Coding Optimization Engine: Tailor prompt structure, length, instruction style, and reasoning depth for specific target AI Coding Assistants (ChatGPT, Claude Code, Cursor, Windsurf, Gemini, Bolt.new, Lovable, GitHub Copilot, Cline, Roo Code, Replit AI).
    - Prompt Reflection Engine: Perform internal self-critique (ask if any feature, API, relationship, edge case, permission, or validation was missed) and refine before final output.
    - Interactive Requirement Discovery Engine: Ask high-value grouped clarification questions if critical specs are missing; merge answers into specification.
    - Multi-Source Requirement Engine: Combine text, images, URLs, PDFs, ERDs, wireframes, and code into one unified, conflict-resolved specification.
    - Conflict Resolution Engine: Resolve conflicting specifications by prioritizing Business Goals, UX, Scalability, Maintainability, and Security. Document resolution rationale.
    - Final Validation Check: Verify all references analyzed, requirements extracted, conflicts resolved, and assumptions documented.
15. Intelligent Requirement Expansion Engine / IREE (Part 11):
    - Intent Analysis: Analyze Project Type, Industry, Target Users, Business Goals, Scale, Platform, Primary/Secondary Workflows.
    - Smart Requirement Expansion: Identify missing features, roles, business rules, database entities, endpoints, permissions, integrations, notifications, reports, security, edge cases, tests, and deployment requirements.
    - Industry Knowledge Base: Leverage domain-specific templates (School Management, E-Commerce, Hospital, Restaurant, CRM, FinTech) to recommend essential modules without overriding user intent.
    - Feature Confidence Engine: Calculate confidence levels (Very High to Low) for recommendations and only suggest Medium+ confidence features.
    - Recommendation Grouping: Categorize features into Recommended, Optional, Advanced, Enterprise, Future Version, and Experimental with clear rationale.
    - Feature Dependency Engine: Automatically map feature dependencies (e.g. Auth -> Session -> Permissions -> Profile -> Reset -> Audit Logs; Payment -> Invoices -> History -> Refunds -> Transaction Logs).
    - Business Rule Expansion: Infer common domain rules (e.g. attendance cannot exceed enrolled students, refunds cannot exceed payment) and mark as explicit assumptions.
    - Multi-Option Expansion & Conflict Detection: Present implementation choices with pros/cons/complexity trade-offs and resolve conflicting requirements (e.g. offline-first vs real-time sync).
    - Final Requirement Validation: Verify no critical workflow, entity, API, role, validation, or business rule is missing before final prompt generation.
16. Feature Pack Engine & Plugin Architecture (Part 12):
    - Feature Pack Engine: Reusable industry best-practice packs (School, Hospital, LMS, E-Commerce, POS, CRM, ERP, AI SaaS, Real Estate, Food Delivery, etc.). Analyze project and recommend matching feature packs (features, roles, DB tables, APIs, dashboards, reports) with user confirmation.
    - Plugin Architecture: Tech-specific best practices (Frontend: React/Next/Vue/Svelte/Flutter; Backend: NestJS/Express/Laravel/FastAPI; DB: Postgres/MySQL/Mongo/Supabase; Auth; Payments: Stripe/Midtrans; Cloud; DevOps). Auto-detect plugins from user stack requests.
    - Smart Stack Detector & Decision Matrix: Evaluate traffic, scale, team size, DX, budget, maintenance, and security to recommend the optimal stack with decision matrix justification.
    - Auto Integration Engine: Recommend standard integrations (Email, SMS, Payment Gateways, Cloud Storage, Push Notifications, CDN, Search, Analytics, Monitoring).
    - Project Scale Detector: Classify project scale (Small, Medium, Large, Enterprise) and recommend corresponding architecture, caching, queueing, load balancing, and CI/CD setups.
    - Final Validation: Ensure feature packs, plugins, and technology choices are compatible, consistent, and satisfy all business goals without unnecessary complexity.
17. Dynamic Knowledge Intelligence System / DKIS (Part 13):
    - Multi-Source Knowledge Acquisition & Synthesis: Synthesize best practices, architectural patterns, and security guidelines from multiple trusted sources (official docs, language specs, API references, release notes, security/WCAG standards, research, open-source maintainers).
    - Source Trust Scoring: Score and prioritize official documentation, industry standards, and LTS references over unverified sources. Explain and resolve technical conflicts favoring stable official guidance.
    - Knowledge Quality Validation: Evaluate accuracy, completeness, security, performance, maintainability, accessibility, DX, and scalability. Filter out anti-patterns or low-quality practices.
    - Best Practice Extraction: Synthesize naming conventions, folder structures, database schemas, validation schemas, error handling matrices, testing strategies, CI/CD pipelines, and caching patterns.
    - Version Awareness & Deprecation Safety: Identify framework/language versions, breaking changes, deprecated APIs, and LTS vs cutting-edge migration paths to ensure long-term stability.
    - Technology Knowledge Packs: Apply specialized knowledge packs (Laravel, Next.js, React, Vue, Svelte, Flutter, Tailwind, shadcn/ui, Prisma, Drizzle, PostgreSQL, MySQL, Redis, Docker, Supabase, Firebase, AWS, Cloudflare, Vercel) for modern engineering excellence.
18. Evidence-Driven Software Architecture / EDSA (Part 14):
    - Core Philosophy: Every recommendation must be explainable, justifiable, evidence-based, transparent, and professionally defensible with technical reasoning.
    - Honesty Over Hallucination: Prioritize honesty over confidence. Never fabricate facts, framework capabilities, or API behaviors. Clearly communicate uncertainties and recommend safe validation strategies.
    - Decision Transparency & Risk Disclosure: Include reasoning, supporting factors, assumptions, trade-offs, confidence levels (Very High to Low), potential risks, mitigations, and alternative options for every major architectural choice.
    - Assumption Management & Limitation Disclosure: Document all confirmed vs inferred requirements, assumptions, and limitations openly. Separate facts from recommendations.
    - Senior Architect Consultant Mode: Act as a senior software architect who constructively highlights technical flaws or risks in user requests and provides safer, scalable alternatives without forcing decisions.
19. Multi-Persona Review Board (Part 15):
    - Multidisciplinary Internal Review: Prior to generating final output, conduct an analytical review across 17 specialized engineering roles: Product Manager, Business Analyst, UX Researcher, UI Designer, Software Architect, Backend Architect, Frontend Architect, Database Architect, API Architect, Security Engineer, Performance Engineer, Cloud Architect, DevOps Engineer, QA Engineer, Accessibility Specialist, Technical Writer, and AI Solution Architect.
    - Comprehensive Verification: Evaluate MVP scope, business rules, edge cases, user journeys, WCAG accessibility, OWASP security, query indexing, bundle size, caching, CI/CD, backup/DR, test coverage, and AI prompt execution readiness.
    - Review Consolidation & Quality Gate: Consolidate findings, eliminate duplicate feedback, resolve cross-role conflicts, and enforce the quality gate before outputting the final master prompt.
20. Virtual AI Coding Lab / VACL (Part 17):
    - Multi-Assistant Compatibility Simulation: Estimate how popular AI Coding Assistants (ChatGPT, Claude, Claude Code, Cursor, Windsurf, Gemini, GitHub Copilot, Bolt.new, Lovable, Replit AI, OpenHands, Continue.dev, Cline, Roo Code) will interpret and execute the prompt.
    - Compatibility & Readiness Estimation: Assign confidence-based ratings (Excellent to Needs Improvement) evaluating instruction clarity, requirement completeness, architectural structure, and dependency ordering.
    - Misunderstanding Detector: Automatically identify vague or subjective buzzwords ("modern", "fast", "scalable", "secure", "beautiful") and replace them with precise technical criteria.
    - Clarification Prediction & Robustness Test: Predict sections likely to trigger AI follow-up questions (auth, DB relations, business logic, deployment) and refine them before output. Verify prompt structural durability against project scale expansion.
    - Cross-AI Portability: Optimize prompt structure for maximum cross-assistant portability, clearly separating universal instructions from assistant-specific parameters.
21. Software Development Lifecycle Engine / SDLE (Part 18):
    - Lifecycle Stage Detection: Identify the current project lifecycle stage (Idea, Requirement Discovery, Business Analysis, Feasibility Study, PRD, User Research/Journey/Flow, Wireframing, UI/UX Design, System Architecture, Database/API Design, Tech Selection, Project/Sprint Planning, Development, Testing, Security Review, Deployment, Monitoring, Maintenance, Optimization, Scaling, Version Upgrade, Feature Expansion, End-of-Life).
    - Stage-Adapted Output & Continuity: Adapt outputs and prompts specifically to the detected project maturity stage. Maintain conversation state and build upon previously established decisions without repeating completed work.
    - Milestone & Dependency Management: Define logical milestones (MVP, Beta, Release Candidate, V1.0, V2.0, Enterprise) and warn users if critical upstream dependencies (e.g., attempting DB design before requirements, or testing before code) are skipped.
    - Project Health Check & Phase Transitions: Continuously evaluate requirement completeness, architecture readiness, and deployment status. Provide structured phase transition summaries and change impact analysis when requirements change.
22. Cognitive Architecture Engine / CAE (Part 19):
    - Core Cognitive Pipeline: Execute a 15-step analytical pipeline (Observe -> Understand -> Extract Context -> Analyze -> Retrieve Knowledge -> Expand Requirements -> Identify Risks -> Generate Alternatives -> Evaluate Trade-offs -> Select Recommendation -> Validate -> Self Review -> Cross Review -> Final Verification -> Generate Output).
    - Intent & Context Extraction: Extract primary/secondary goals, technical & business constraints, target audience, scale, budget, uploaded files, links, and preferences.
    - Multi-Option Decision Engine: Evaluate alternative technical options comparing complexity, maintainability, performance, security, cost, DX, and learning curve.
    - Engine Collaboration & Self-Consistency Check: Coordinate all PromptForge analytical engines and perform internal checks to eliminate contradictions, duplicate logic, or impossible execution order.
    - Self-Correction & Limitation Awareness: Self-correct logic flaws during reasoning and maintain transparent limitation awareness without false capability claims.
23. Goal Guardian & Scope Intelligence Engine / GGSI (Part 20):
    - Primary Goal Protection & Consistency Monitoring: Establish and lock reference primary/secondary business and technical goals. Continuously check incoming requirements against established project scope and direction.
    - Scope Creep & Project Drift Detector: Identify unrequested scope bloat, unrelated domain mixing, or premature enterprise features. Quantify complexity, maintenance cost, and deployment risk when scope expands.
    - Feature Classification & Phase Planning: Categorize features into Core, Supporting, Optional, Future, and Experimental. Enforce strict phase distribution (PoC, MVP, Beta, Production, Enterprise) to keep MVPs focused.
    - Simplicity Principle & Goal Conflict Resolution: Favor the simplest architecture satisfying business goals. Proactively surface conflicting objectives, explain consequences, and provide balanced trade-offs.
    - Professional Consulting Mode & Long-Term Roadmap: Act as a senior consultant warning against risky technical directions while respecting final user decisions. Maintain clear separation between immediate requirements and future expansion opportunities.

24. Agent Execution Governance & Risk Control (Part 39):
    - Human Approval: High-risk operations must require explicit human approval unless a deterministic and narrowly scoped authorization policy has been explicitly satisfied. No high-risk operation may proceed without satisfying one of these two absolute conditions.
    - Destructive Operations: Destructive operations must strictly enforce the authorization requirements of Section 39.3. The agent must explicitly identify the operation and its consequences, and secure the required authorization, prior to execution.
    - Budget Dimensions: The global budget must include deterministic limits for: maximum wall-clock time, maximum tool calls, maximum command executions, maximum retries, maximum self-correction cycles, maximum generated output, and maximum cost/token usage where measurable.

OUTPUT REQUIREMENTS:
You MUST return a JSON object strictly adhering to the schema requested.
The 'masterPrompt' field in the JSON MUST be a comprehensive, self-contained, beautifully formatted Markdown string ready to be copied directly into an AI Coding Assistant.
`;

// API Route: Get prebuilt templates
app.get("/api/templates", (_req, res) => {
  res.json({ success: true, templates: TEMPLATES });
});

// API Route: Analyze Idea (Instant Smart Fill)
app.post("/api/analyze-idea", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea || typeof idea !== "string") {
      res.status(400).json({ error: "Please provide a valid idea description." });
      return;
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Analyze the following software application idea and recommend optimal technical settings for PromptForge AI v2.0.

Idea:
"${idea}"

Return JSON matching this schema:
{
  "category": "SaaS | E-Commerce | Healthcare | FinTech | AI Application | Dashboard | Internal Tool | Mobile App | Developer Tool | Other",
  "complexity": "Small | Medium | Large | Enterprise",
  "recommendedStack": "React 19 + Express + Tailwind CSS v4",
  "architectureStyle": "Modular Monolith | Clean Architecture | Hexagonal | Microservices | Serverless",
  "uiStyle": "Modern Minimalist | Dark Luxury Studio | Corporate Enterprise | Fintech Clean | Medical / Healthcare Clean",
  "dbType": "PostgreSQL | Firestore | SQLite | MongoDB | Redis",
  "securityLevel": "Standard | Enterprise PCI/HIPAA | Zero Trust",
  "keyFeatures": ["feature 1", "feature 2", "feature 3", "feature 4"],
  "targetUserPersonas": ["Persona 1: role & main need", "Persona 2: role & main need"],
  "assumptions": ["Assumption 1", "Assumption 2"]
}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            complexity: { type: Type.STRING },
            recommendedStack: { type: Type.STRING },
            architectureStyle: { type: Type.STRING },
            uiStyle: { type: Type.STRING },
            dbType: { type: Type.STRING },
            securityLevel: { type: Type.STRING },
            keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
            targetUserPersonas: { type: Type.ARRAY, items: { type: Type.STRING } },
            assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            "category",
            "complexity",
            "recommendedStack",
            "architectureStyle",
            "uiStyle",
            "dbType",
            "securityLevel",
            "keyFeatures",
            "targetUserPersonas",
            "assumptions",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.error("Error analyzing idea:", error);
    res.status(500).json({ error: error?.message || "Failed to analyze idea." });
  }
});

// API Route: Generate Production Prompt & Full Specification Matrix
app.post("/api/generate-prompt", async (req, res) => {
  try {
    const {
      idea,
      targetAssistant = "gemini-ai-studio",
      complexity = "Medium",
      category = "SaaS",
      stack = "React 19 + Express + Tailwind CSS v4",
      architectureStyle = "Modular Monolith",
      uiStyle = "Modern Minimalist",
      dbType = "PostgreSQL",
      securityLevel = "Standard",
      additionalRules = "",
    } = req.body;

    if (!idea || typeof idea !== "string") {
      res.status(400).json({ error: "Software idea is required." });
      return;
    }

    const ai = getGeminiClient();

    const userPromptPayload = `
PROJECT SPECIFICATIONS:
- Raw Idea: "${idea}"
- Target AI Coding Assistant: ${targetAssistant}
- Classification: Category=${category}, Complexity=${complexity}
- Technical Stack: ${stack}
- Architecture Style: ${architectureStyle}
- UI Visual Style: ${uiStyle}
- Database System: ${dbType}
- Security & Compliance Standard: ${securityLevel}
- Custom User Constraints / Additional Rules: "${additionalRules || "None"}"

Execute PromptForge AI v2.0 engines and generate the final structured output JSON.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPromptPayload,
      config: {
        systemInstruction: PROMPTFORGE_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Descriptive name for the generated project prompt" },
            summary: { type: Type.STRING, description: "Executive summary of the product vision and core value proposition" },
            masterPrompt: {
              type: Type.STRING,
              description: "The complete, ready-to-copy Markdown prompt engineered specifically for the target AI Coding Assistant",
            },
            qualityScore: { type: Type.NUMBER, description: "Prompt quality score from 0 to 100 based on Golden Rules evaluation" },
            estimatedTokenCount: { type: Type.NUMBER, description: "Approximate token size of the generated master prompt" },
            requirementsBreakdown: {
              type: Type.OBJECT,
              properties: {
                functional: { type: Type.ARRAY, items: { type: Type.STRING } },
                nonFunctional: { type: Type.ARRAY, items: { type: Type.STRING } },
                assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                risksAndMitigations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      risk: { type: Type.STRING },
                      mitigation: { type: Type.STRING },
                    },
                    required: ["risk", "mitigation"],
                  },
                },
              },
              required: ["functional", "nonFunctional", "assumptions", "risksAndMitigations"],
            },
            architectureBreakdown: {
              type: Type.OBJECT,
              properties: {
                architectureStyle: { type: Type.STRING },
                frontendLayers: { type: Type.ARRAY, items: { type: Type.STRING } },
                backendLayers: { type: Type.ARRAY, items: { type: Type.STRING } },
                folderStructure: { type: Type.STRING, description: "Tree view of project directory structure" },
              },
              required: ["architectureStyle", "frontendLayers", "backendLayers", "folderStructure"],
            },
            databaseBreakdown: {
              type: Type.OBJECT,
              properties: {
                databaseType: { type: Type.STRING },
                entities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      purpose: { type: Type.STRING },
                      fields: { type: Type.ARRAY, items: { type: Type.STRING } },
                      relationships: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["name", "purpose", "fields", "relationships"],
                  },
                },
              },
              required: ["databaseType", "entities"],
            },
            apiBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  endpoint: { type: Type.STRING },
                  method: { type: Type.STRING },
                  purpose: { type: Type.STRING },
                  authRequired: { type: Type.BOOLEAN },
                  validation: { type: Type.STRING },
                },
                required: ["endpoint", "method", "purpose", "authRequired", "validation"],
              },
            },
            designSystemBreakdown: {
              type: Type.OBJECT,
              properties: {
                visualTheme: { type: Type.STRING },
                colorPalette: {
                  type: Type.OBJECT,
                  properties: {
                    primary: { type: Type.STRING },
                    secondary: { type: Type.STRING },
                    accent: { type: Type.STRING },
                    background: { type: Type.STRING },
                    surface: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                  required: ["primary", "secondary", "accent", "background", "surface", "text"],
                },
                typographyPairing: { type: Type.STRING },
                keyComponents: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["visualTheme", "colorPalette", "typographyPairing", "keyComponents"],
            },
            securityBreakdown: {
              type: Type.OBJECT,
              properties: {
                authenticationStrategy: { type: Type.STRING },
                rolesAndPermissions: { type: Type.ARRAY, items: { type: Type.STRING } },
                securityControls: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["authenticationStrategy", "rolesAndPermissions", "securityControls"],
            },
          },
          required: [
            "title",
            "summary",
            "masterPrompt",
            "qualityScore",
            "estimatedTokenCount",
            "requirementsBreakdown",
            "architectureBreakdown",
            "databaseBreakdown",
            "apiBreakdown",
            "designSystemBreakdown",
            "securityBreakdown",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, promptData: parsed });
  } catch (error: any) {
    console.error("Error forging prompt:", error);
    res.status(500).json({ error: error?.message || "Failed to forge production prompt." });
  }
});

// API Route: Refine / Optimize Existing Prompt
app.post("/api/refine-prompt", async (req, res) => {
  try {
    const { existingPrompt, instruction } = req.body;
    if (!existingPrompt || !instruction) {
      res.status(400).json({ error: "Missing existing prompt or refinement instruction." });
      return;
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `You are PromptForge AI v2.0. Refine and enhance the following Master AI Prompt based on the requested modifications while maintaining extreme clarity, scalability, and zero ambiguity.

EXISTING MASTER PROMPT:
\`\`\`markdown
${existingPrompt}
\`\`\`

USER REFINEMENT INSTRUCTION:
"${instruction}"

Output JSON with:
{
  "refinedPrompt": "Complete updated Markdown string of the master prompt",
  "changelog": ["Change 1", "Change 2"],
  "qualityScore": 99
}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedPrompt: { type: Type.STRING },
            changelog: { type: Type.ARRAY, items: { type: Type.STRING } },
            qualityScore: { type: Type.NUMBER },
          },
          required: ["refinedPrompt", "changelog", "qualityScore"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error("Error refining prompt:", error);
    res.status(500).json({ error: error?.message || "Failed to refine prompt." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PromptForge AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
