# Heuristic Evaluation Report: Uber

**Evaluator:** AIxHE Auditor
**Date:** 2026-06-06
**Framework:** Nielsen's 10 Usability Heuristics (NNgroup)

## Executive Summary
This evaluation reviews the core ride-booking flow of the Uber mobile application. Overall, the app is highly efficient and excels at *Match between system and the real world*, utilizing maps effectively. However, issues regarding error prevention with GPS accuracy and system status visibility during driver matching were identified.

---

## Identified Violations

### 1. Fluctuating ETA during Matchmaking
**Heuristic Violated:** #1 Visibility of system status
**Severity:** 3 (Major usability problem)
**Description:** When searching for a driver, the initial ETA might say "4 mins", but once a driver is found, it may suddenly jump to "12 mins" without any clear explanation of why the change occurred (e.g., driver finishing another trip).
**Recommendation:** Provide contextual information if the ETA changes significantly. For example, "Matched with a driver completing a nearby trip. ETA updated to 12 mins."

### 2. GPS "Bounce" Causing Incorrect Pickup Locations
**Heuristic Violated:** #5 Error prevention
**Severity:** 4 (Usability catastrophe)
**Description:** The app auto-fills the pickup location based on GPS. In urban environments, GPS "bounce" can place the pin a block away. Users often confirm the ride quickly without noticing the pin is slightly off.
**Recommendation:** Require explicit confirmation of the pickup address text, or implement a brief warning if the pin is placed in a location where the user hasn't historically requested rides, asking "Are you sure this is the correct pickup spot?"

### 3. Hidden Multi-stop Functionality
**Heuristic Violated:** #7 Flexibility and efficiency of use
**Severity:** 2 (Minor usability problem)
**Description:** Adding a stop during the booking process is done via a small '+' icon next to the destination field. Many novice users are unaware this feature exists or struggle to find it while hastily booking a ride.
**Recommendation:** Increase the visual prominence of the "Add Stop" button or provide a subtle one-time tooltip for users who frequently cancel and rebook rides.

### 4. Cancellation Fee Unclarity
**Heuristic Violated:** #6 Recognition rather than recall
**Severity:** 3 (Major usability problem)
**Description:** When a user goes to cancel a ride, the interface states a fee *may* apply, requiring the user to recall the exact cancellation window rules (e.g., 2 minutes) rather than explicitly stating "You will be charged $5 if you cancel now."
**Recommendation:** Explicitly calculate and display the exact cancellation fee (or $0 if within the grace period) directly on the cancellation confirmation screen.
