# Heuristic Evaluation Report: Notion

**Product:** Notion (Desktop App & Mobile App)  
**Evaluator:** UX Audit Team  
**Date:** June 2026  
**Scope:** Block Editor, Database View Switching, and Workspace Navigation  

---

## 1. Executive Summary
Notion is highly regarded for its Aesthetic and Minimalist Design (Heuristic 8) and Flexibility of Use (Heuristic 7). However, because Notion behaves as a sandbox, the lack of default structure leads to navigational issues. Its database config panels and mobile app navigation suffer from poor feedback and lack of exits, violating User Control & Freedom (Heuristic 3) and Consistency & Standards (Heuristic 4).

---

## 2. Findings & Violations Summary

| ID | Issue Description | Heuristic Violated | Severity | Recommended Fix |
|---|---|---|---|---|
| 01 | **Invisible Database Filter States:** In a database board view, filters are hidden under a generic "Filter" button, making it hard to see that a filter is currently active and hiding items. | H1: Visibility of System Status | 2 (Minor) | Display active filters as visible colored chips directly above the database columns (e.g. "Status: In Progress [x]"). |
| 02 | **Unclear Slash Command Keyboard Shortcuts:** Typing `/` opens a menu, but pressing `Enter` defaults to creating text rather than displaying search results if the user misspelled a command, forcing them to backspace completely. | H9: Help Users Recognize, Diagnose, & Recover from Errors | 2 (Minor) | Show fuzzy-matched alternatives for slash commands (e.g., typing `/calndr` should suggest `/calendar` instead of creating raw text). |
| 03 | **Lost Breadcrumbs on Mobile:** Deep page hierarchies are flattened on the mobile app, replacing the desktop breadcrumbs bar with a single "Back" button, which disorients users about their location in the workspace. | H6: Recognition Rather Than Recall / H4: Consistency & Standards | 3 (Major) | Include a collapsible breadcrumb dropdown or navigation trail at the top of the mobile screen. |
| 04 | **Destructive Database Deletion:** Deleting a database column (property) instantly deletes all data stored in that column across hundreds of pages, with the "Undo" notification disappearing after 5 seconds. | H3: User Control & Freedom / H5: Error Prevention | 3 (Major) | Require typing the column's name to confirm deletion, or make deleted columns retrievable from a "Property Trash" for 30 days. |

---

## 3. Detailed Findings

### Issue 01: Invisible Database Filter States (Severity 2)
*   **Description:** When a user sets a filter on a task database (e.g., "Assignee is Me"), the database view updates. If another user visits the page later, the "Filter" button text changes color slightly, but they do not realize they are looking at a subset of data. They might assume tasks have been deleted.
*   **Heuristic Violation:** *Visibility of System Status (Heuristic 1)*. The system does not clearly show that the active state is currently filtering the dataset.
*   **Recommendation:** Render a clean banner at the top of filtered databases saying "Showing filtered results: [Assignee is Me] (Show All)".

### Issue 04: Destructive Database Deletion (Severity 3)
*   **Description:** If a user clicks a property name in a database header and selects "Delete", Notion shows a tiny confirmation modal. If they confirm, all data in that column is deleted. If they realize 10 seconds later that they deleted the wrong column, the undo toast is already gone, and they have to restore an entire workspace backup to recover it.
*   **Heuristic Violation:** *Error Prevention (Heuristic 5)* & *User Control and Freedom (Heuristic 3)*. The action is highly destructive, is not guarded by robust prevention checks, and lacks an accessible recovery path once the brief toast notification disappears.
*   **Recommendation:** Hold deleted columns in a temporary archive that can be restored via page history or page settings.
