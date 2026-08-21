# Heuristic Evaluation Report: Google Maps

**Evaluator:** AIxHE Auditor
**Date:** 2026-06-06
**Framework:** Nielsen's 10 Usability Heuristics (NNgroup)

## Executive Summary
Google Maps is an industry standard for navigation. However, the app has become cluttered with local guide features and business promotions, complicating the core task of route planning.

---

## Identified Violations

### 1. Map Clutter Obscuring Routes
**Heuristic Violated:** #8 Aesthetic and minimalist design
**Severity:** 2 (Minor usability problem)
**Description:** When viewing a route, the map is often cluttered with icons for sponsored restaurants, gas stations, and user photos. This visually competes with the actual navigation line.
**Recommendation:** Automatically fade out or hide non-essential, non-route-related business icons once a user enters "Navigation Preview" mode.

### 2. Unpredictable Rerouting
**Heuristic Violated:** #1 Visibility of system status
**Severity:** 3 (Major usability problem)
**Description:** The app sometimes automatically reroutes the user to save time (e.g., "Found a 2-minute faster route"). If the user misses the brief verbal or visual prompt, they may end up on an unfamiliar highway without realizing why.
**Recommendation:** Require explicit confirmation (e.g., "Tap to accept faster route") for major detours involving highways or tolls, rather than auto-accepting after a timeout.
