# Heuristic Evaluation Report: WhatsApp

**Evaluator:** AIxHE Auditor
**Date:** 2026-06-06
**Framework:** Nielsen's 10 Usability Heuristics (NNgroup)

## Executive Summary
WhatsApp provides a robust, widely-used messaging experience. However, certain destructive actions lack sufficient safeguards, leading to unrecoverable errors.

---

## Identified Violations

### 1. "Delete for Me" vs "Delete for Everyone"
**Heuristic Violated:** #5 Error prevention / #9 Error recovery
**Severity:** 4 (Usability catastrophe)
**Description:** When trying to delete an embarrassing message sent to a group, users often accidentally tap "Delete for Me" instead of "Delete for Everyone". This removes the message locally, destroying the ability to delete it for others.
**Recommendation:** Redesign the delete dialog to clearly separate these actions visually, or provide a brief "Undo" option specifically for the "Delete for Me" action.

### 2. Hidden Broadcast Lists
**Heuristic Violated:** #6 Recognition rather than recall
**Severity:** 2 (Minor usability problem)
**Description:** Creating and finding Broadcast Lists is buried in top menus and visually looks identical to groups. Users struggle to remember how to access them compared to standard chats.
**Recommendation:** Provide a dedicated filter or tab for Broadcast Lists, or visually differentiate broadcast icons from standard group icons in the main chat feed.
