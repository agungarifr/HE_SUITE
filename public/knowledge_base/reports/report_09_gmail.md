# Heuristic Evaluation Report: Gmail

**Product:** Gmail (Web Client)  
**Evaluator:** UX Audit Team  
**Date:** June 2026  
**Scope:** Email Composition, Inbox Category Tabs, and Search Filters  

---

## 1. Executive Summary
Gmail is a pioneer in web-based email clients, boasting excellent error prevention (e.g. attachment reminders) and high search flexibility. However, its category tabs (Primary, Social, Promotions) confuse users about where messages are, and its message composition drafts can be easily lost or minimized into obscurity, violating User Control & Freedom (Heuristic 3) and Consistency & Standards (Heuristic 4).

---

## 2. Findings & Violations Summary

| ID | Issue Description | Heuristic Violated | Severity | Recommended Fix |
|---|---|---|---|---|
| 01 | **Invisible Attachment Warning:** Tapping "Send" when the email body mentions "see attached" but no file is uploaded triggers a warning, which is excellent. However, there is no similar warning if the user writes "find enclosed" or synonyms. | H5: Error Prevention | 2 (Minor) | Expand the regex dictionary of attachment-related keywords to trigger the reminder (e.g., "enclosed", "attached pdf"). |
| 02 | **Confusing Inbox Category Tabs:** The Primary/Promotions/Social tabs automatically sort emails, causing users to miss important messages that are miscategorized without any notifications on the tabs themselves. | H1: Visibility of System Status / H4: Consistency & Standards | 3 (Major) | Add notification count badges (e.g., "5 new") to the Promotions/Social tabs, or show a toast message when an email is automatically archived or sorted out of the Primary inbox. |
| 03 | **Hidden Mini-Compose State:** Minimizing a compose window shrinks it to the bottom-right header. If the user opens multiple drafts, they stack on top of each other, completely hiding the text of earlier drafts. | H6: Recognition Rather Than Recall / H8: Aesthetic & Minimalist | 2 (Minor) | Stack minimized compose cards horizontally rather than overlapping them, or display a dropdown list of "Open Drafts". |
| 04 | **Accidental Draft Discarding:** Clicking the trash can icon at the bottom of a draft deletes the draft instantly, requiring users to navigate to the "Trash" folder to recover it instead of providing an undo option. | H3: User Control & Freedom | 2 (Minor) | Show an "Undo Discard" toast notification immediately after a draft is deleted, identical to the "Undo Sent" functionality. |

---

## 3. Detailed Findings

### Issue 02: Confusing Inbox Category Tabs (Severity 3)
*   **Description:** Gmail automatically filters incoming emails into tabs like "Primary", "Social", "Promotions", and "Updates". Often, critical emails (such as bank notices or flight confirmations) are sorted into "Updates" or "Promotions". Because users only check the "Primary" tab, they miss these emails. There is no alert or highlight showing that a new, unread email has entered a secondary tab.
*   **Heuristic Violation:** *Visibility of System Status (Heuristic 1)*. The system performs background actions (sorting incoming data) without notifying the user of the state change.
*   **Recommendation:** Place an unread badge on each tab header to make sorting visible.

### Issue 03: Hidden Mini-Compose State (Severity 2)
*   **Description:** While writing an email, a user can minimize the compose dialog box to view their inbox. The box shrinks to a small bar at the bottom right. If they open another email and hit reply, a second box overlays the first one. The user has no visual reminder that the first draft is still open underneath.
*   **Heuristic Violation:** *Recognition Rather Than Recall (Heuristic 6)*. The interface forces the user to remember they had a draft open in the background, rather than keeping all active items recognizable.
*   **Recommendation:** Implement tabbed compose windows or place a list indicator of active drafts.
