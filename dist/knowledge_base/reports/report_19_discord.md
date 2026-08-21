# Heuristic Evaluation Report: Discord

**Evaluator:** AIxHE Auditor
**Date:** 2026-06-06
**Framework:** Nielsen's 10 Usability Heuristics (NNgroup)

## Executive Summary
Discord is a powerful communication platform primarily aimed at gamers but expanding to general communities. The app's deep customization creates a steep learning curve, violating several principles for novice users.

---

## Identified Violations

### 1. Overwhelming Notification Settings
**Heuristic Violated:** #8 Aesthetic and minimalist design
**Severity:** 3 (Major usability problem)
**Description:** Finding out why a server is constantly pinging the user requires navigating a complex hierarchy of server-level, channel-level, and role-level notification overrides.
**Recommendation:** Provide a simple "Mute All EXCEPT Direct Mentions" toggle prominently at the top of every server, and a unified dashboard showing exactly where current unread pings are coming from.

### 2. Ambiguous Role Permissions
**Heuristic Violated:** #10 Help and documentation
**Severity:** 4 (Usability catastrophe)
**Description:** For server administrators, the role permissions matrix is extremely complex. It is often unclear how channel-specific overrides interact with global role permissions, leading to accidental data exposure or locked channels.
**Recommendation:** Implement a "View As Role" simulator button directly within the permissions screen so admins can immediately test and verify what a specific user can or cannot see.
