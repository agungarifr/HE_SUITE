# Heuristic Evaluation Report: DoorDash

**Evaluator:** AIxHE Auditor
**Date:** 2026-06-06
**Framework:** Nielsen's 10 Usability Heuristics (NNgroup)

## Executive Summary
DoorDash effectively connects users with local restaurants. The evaluation highlights issues with checkout transparency and system status during edge-case delivery scenarios.

---

## Identified Violations

### 1. Unclear Tipping Interface Impact
**Heuristic Violated:** #2 Match between system and the real world
**Severity:** 3 (Major usability problem)
**Description:** The tipping interface defaults to specific amounts without clearly explaining that lower tips may result in significantly longer delivery times, a system reality that deviates from real-world post-service tipping norms.
**Recommendation:** Add a subtle tooltip or info icon explaining that tips act as a "bid" for drivers, helping set accurate expectations for delivery speed.

### 2. Inaccurate Real-time Tracking
**Heuristic Violated:** #1 Visibility of system status
**Severity:** 3 (Major usability problem)
**Description:** When a driver is handling multiple orders (a "stacked" order), the map tracking can be highly misleading, showing the driver going in the opposite direction without clearly communicating *why*.
**Recommendation:** Explicitly display on the map screen when the driver is completing another delivery first. Example: "Your Dasher is completing a nearby order and will head to you next."
