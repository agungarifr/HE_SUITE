# Heuristic Evaluation Report: Microsoft Teams

**Evaluator:** AIxHE Auditor
**Date:** 2026-06-06
**Framework:** Nielsen's 10 Usability Heuristics (NNgroup)

## Executive Summary
Microsoft Teams is an enterprise collaboration tool. Its deep integration with Office 365 is powerful, but its navigation and file management interfaces violate recognition and consistency heuristics.

---

## Identified Violations

### 1. Confusing "Teams" vs "Chat" Paradigms
**Heuristic Violated:** #2 Match between system and the real world
**Severity:** 3 (Major usability problem)
**Description:** The distinction between sending a message in a "Channel" within a Team versus sending a message in a multi-person "Chat" is confusing. Files shared in one go to SharePoint, while files in the other go to OneDrive.
**Recommendation:** Unify the mental model or provide a clear, onboarding explanation. Add a universal "Files" search that aggregates both SharePoint and OneDrive intuitively.

### 2. Difficulty Finding Previous Meetings
**Heuristic Violated:** #6 Recognition rather than recall
**Severity:** 2 (Minor usability problem)
**Description:** After a meeting ends, finding the meeting chat, recording, or shared files requires navigating back to the calendar and remembering the exact date/time, or digging through the generic chat list.
**Recommendation:** Create a dedicated "Recent Meetings" tab that automatically collates the chat history, recording link, and shared files into a single easily accessible dashboard for 7 days post-meeting.
