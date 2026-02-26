Developer: # VetPivot Dashboard Alpha – Implementation Spec

This spec defines the implementation of the **VetPivot Dashboard Alpha**, a post-translation results experience that transforms raw AI output into a structured, actionable dashboard for users.

The overarching objective is to evolve VetPivot from just a translation tool into a **translation + clarity product**, while maintaining disciplined MVP practices. Focus is on signal generation, not feature-completeness, emphasizing clarity and actionable feedback.

Begin with a concise checklist (3-7 bullets) of what you will do; keep items conceptual, not implementation-level.

---

## 🎯 2. Goal

After users submit military experience for translation, they should be seamlessly transitioned into a **dashboard-style results view** providing:

- Translation strength score
- Top 3 compatible civilian roles
- Translation strengths
- Civilian alignment gaps
- Translated bullet export

**The dashboard must:**
- Enhance clarity
- Increase perceived product value
- Provide a portable artifact (bullet export)
- Enable real-world validation

---

## 🧑‍💻 3. Tech Stack Context

Feature must remain within the existing architecture:

**Frontend:**
- React (Vite)
- TailwindCSS
- Single-page application (SPA)

**Backend:**
- FastAPI (Cloud Run)
- Existing translation endpoint (unchanged)

**Hosting:**
- Firebase Hosting (frontend)
- Google Cloud Run (backend)

---

## 🚫 4. Non-Goals (Out of Scope)

To uphold MVP discipline, explicitly exclude:

- Authentication
- Database changes
- User accounts
- Saved dashboards
- PDF generation
- Email exports
- Routing changes
- Analytics instrumentation (for now)
- Complex charts (radar, graphs, etc.)

> **This is a frontend-driven clarity layer only.**

---

## 🤔 5. Core Product Hypothesis

Users seek more than translated text:
- Self-understanding
- Direction
- Confidence

The dashboard explores whether:

> Structured insight > raw AI output

This spec aims to validate that hypothesis.

---

## 🖥️ 6. UX Flow

### State Model

App remains a **single route**, with two main UI states:

#### State 1 — Input Mode (Existing)
Displays:
- Input form
- MOS/keyword entry
- Bullet narrative input
- Translate CTA

---

#### State 2 — Dashboard Mode (New)
Triggered after successful translation, UI transitions to dashboard layout.

**Transition should:**
- Feel like a soft screen transformation (e.g., fade, card expansion, or conditional rendering), not a hard page change.

---

## 🧳 7. Dashboard Layout (V1 Structure)

**Section 1 — Translation Strength Score**
- Prominent numeric score (e.g., 74%)
- Label: "Translation Strength"
- Plain numeric display is sufficient; heuristic-based, not scientific

---

**Section 2 — Top 3 Role Matches**
- Shows strongest ONET-aligned roles
- Format: Role name + percentage (top 3 only)
- Example: 
  - Operations Manager — 82%
  - Project Manager — 76%
  - Logistics Coordinator — 71%

---

**Section 3 — Translation Strengths**
- LLM-derived summary: “What translates well into civilian contexts”
- Supportive and confidence-building in tone

---

**Section 4 — Civilian Alignment Opportunities**
- Reframed gaps section (no "weakness" or "deficit")
- Encouraging, practical, non-critical tone

---

**Section 5 — Translated Bullet Bank**
- Resume-ready translated bullets
- Scrollable container
- Considered the primary utility layer

---

**Section 6 — Export Actions**
- Buttons: Copy Bullets (clipboard), Download Bullets (.txt)
- No PDF or additional formats in Alpha

---

**Section 7 — Reset Action**
- Allow users to return to input mode
- Example: "Run Another Translation" button
- Must fully reset dashboard state

---

## 🧮 8. Scoring Model (Alpha Heuristic)

**Translation Strength Score:**
- Derived from semantic clarity, keyword alignment, and simple confidence heuristic
- Simplicity and consistency prioritized over mathematical rigor

**Role Match Scores:**
- Based on ONET keyword overlap, semantic similarity, lightweight scoring logic
- Deliver believable and stable scores (range 60–90%), avoid extremes

---

## 📂 9. File Impact Scope

**Minimize blast radius within repo.**

**Likely modified:**
- `App.tsx` (state management/control)
- `components/InputForm.tsx` (minor adjustments)

**New components expected:**
- `components/Dashboard.tsx`
- `components/ScoreCard.tsx` (optional)
- `components/RoleMatches.tsx` (optional)

> Component splitting encouraged but not mandatory.

---

## 🧑‍🔬 10. Success Criteria

Success if:
- Translation triggers dashboard mode
- Dashboard renders without routing changes
- Users clearly understand results
- Bullets are copyable and downloadable (.txt)
- User can reset to run again
- No performance optimization required for Alpha

---

## 🧑‍💼 11. Guardrails for Codex

Codex must:
- Respect SPA architecture
- Avoid unnecessary dependencies
- Do not introduce routing libraries
- Do not modify backend APIs
- Avoid unrelated component refactors

If unsure at any step, default to minimal change and ask for clarification before implementing destructive or irreversible actions.

---

## 🤖 12. Implementation Phases

**Phase 1 — Dashboard Scaffold**
- Create dashboard component with static placeholder content

**Phase 2 — UI State Transition**
- Toggle Input → Dashboard mode while preserving translation payload

**Phase 3 — Layout Completion**
- Implement all dashboard sections: Score, Roles, Strengths, Gaps, Bullet bank

**Phase 4 — Scoring Heuristics**
- Inject computed scores, stabilize output ranges

**Phase 5 — Export Functionality**
- Implement copy-to-clipboard and .txt download

After each substantive code change, validate that the alteration achieves the intended UI or logic effect in 1-2 sentences and self-correct if validation fails.

---

## 🚀 13. Future Extensions (Out of Scope)

Documented for future clarity (not for Alpha):
- Shareable dashboard URLs
- PDF export
- Email capture
- Saved profiles
- Multi-translation comparison
- Historical progress tracking
- Paid report tiers

> These are post-signal roadmap items.

---

## 🧠 14. Strategic Intent

Transition VetPivot from a basic AI tool to an insight product.

Primary focus:
- Signal density
- User clarity
- Real-world usefulness

> This dashboard is a **validation multiplier**.

---

## 📋 15. Definition of Done (Alpha)

Alpha feature is complete when:
- Dashboard renders reliably
- Results are instantly understandable
- Export functions work smoothly
- No regressions to translation flow
- No new routing complexity

> **Polish is secondary to stability.**