# Heuristic Evaluation: The 5W2H Framework (NNgroup Principles)

This document provides a comprehensive guide to understanding and conducting Heuristic Evaluations based on research and publications by the **Nielsen Norman Group (NN/g)**. It is structured using the **5W2H** framework (Who, What, Where, When, Why, How, How Much) to make it highly actionable.

---

## 1. WHO (The Evaluators & Stakeholders)
*   **Who conducts the evaluation?**
    *   Ideally, **UX experts, usability specialists, or experienced product designers** who understand human-computer interaction (HCI) principles.
    *   Nielsen Norman Group recommends using **3 to 5 evaluators**. A single evaluator typically only catches about 35% of usability issues. Adding more evaluators increases the coverage, with 5 evaluators finding about 75% to 85% of usability problems. Beyond 5, the cost-benefit ratio declines as they start finding duplicate issues.
*   **Who is it for?**
    *   **Product teams, developers, and stakeholders** who need a fast, objective assessment of their product's usability before releasing it to real users.

---

## 2. WHAT (The Scope & The Heuristics)
*   **What is Heuristic Evaluation?**
    *   It is a **usability inspection method** where one or more evaluators systematically inspect a user interface (UI) to check if it conforms to established usability principles (the "heuristics").
*   **What principles are used?**
    *   The industry standard is **Jakob Nielsen's 10 Usability Heuristics**:
        1.  *Visibility of System Status*
        2.  *Match Between System and the Real World*
        3.  *User Control and Freedom*
        4.  *Consistency and Standards*
        5.  *Error Prevention*
        6.  *Recognition Rather Than Recall*
        7.  *Flexibility and Efficiency of Use*
        8.  *Aesthetic and Minimalist Design*
        9.  *Help Users Recognize, Diagnose, and Recover from Errors*
        10. *Help and Documentation*

---

## 3. WHERE (The Environments & Platforms)
*   **Where is it applied?**
    *   Any user interface, including **web applications, mobile apps, desktop software, smart devices, wearable tech, and kiosk interfaces**.
    *   It can be performed on **wireframes, interactive prototypes, or live, fully-developed production applications**.
*   **Where is the evaluation done?**
    *   Typically done in a quiet workspace. Evaluators perform their inspection **individually** (either on their own machines or in a laboratory) to prevent groupthink and bias. Later, they meet in a workspace (virtual or physical) to consolidate findings.

---

## 4. WHEN (The Lifecycle Stages)
*   **When in the design process is it done?**
    *   **Early in Design:** On low-fidelity wireframes or mockups to catch structural issues before code is written.
    *   **During Development:** On interactive prototypes to refine user flows, micro-interactions, and visual layouts.
    *   **Post-Launch / Auditing:** On legacy or competitor websites to identify areas for redesign or benchmarking.
*   **When should it NOT replace user testing?**
    *   Heuristic evaluation is a *precursor* to user testing. It should be done first to clean up obvious usability bugs, so that subsequent user testing sessions can focus on deep, task-based user behaviors rather than being derailed by basic interface errors.

---

## 5. WHY (The Value & Benefits)
*   **Why choose Heuristic Evaluation over other methods?**
    *   **Speed:** Can be conducted in a matter of days compared to weeks for full-scale user testing.
    *   **Low Friction:** Does not require recruiting, scheduling, compensating, or briefing real users.
    *   **Actionability:** Because the findings directly reference design principles, they provide developers with clear, structural reasons why an interface fails and how to fix it.
    *   **Cost-Effectiveness:** Finding and fixing usability bugs before coding is up to 100 times cheaper than fixing them post-launch.

---

## 6. HOW (The Step-by-Step Process)
To perform a professional heuristic evaluation, NN/g details a three-stage process:

### Phase A: Preparation
1.  **Define the Scope:** Clearly list which flows or features will be evaluated (e.g., "The Guest Checkout Flow").
2.  **Establish Heuristics & Standards:** Confirm the set of heuristics and prepare a logging spreadsheet or workbook.
3.  **Brief the Evaluators:** Explain the target users, business goals, and typical scenarios.

### Phase B: Individual Inspection
1.  **Independent Review:** Each evaluator walks through the interface *completely alone* to inspect the screens.
2.  **Log Violations:** For each issue discovered, the evaluator logs:
    *   *Where:* The exact page, screen, or UI element.
    *   *What:* A description of the problem.
    *   *Why:* The specific Nielsen heuristic violated.
    *   *Severity:* An initial rating of how bad the issue is.

### Phase C: Consolidation & Reporting
1.  **Synthesis Meeting:** Evaluators meet to merge their individual lists, eliminating duplicates.
2.  **Assign Final Severities:** Agree on a consensus severity rating for each issue.
3.  **Write Recommendations:** Propose actionable design improvements or redesigns for each violation.
4.  **Present Report:** Output the results as a prioritized roadmap for the development team.

---

## 7. HOW MUCH (The Resources & Severity Scale)
*   **How much time is required?**
    *   **Evaluator time:** Usually 1 to 2 hours per evaluator for the inspection, plus 1 to 2 hours for consolidation.
    *   **Total calendar time:** 2 to 5 days from kickoff to final report.
*   **How much does it cost?**
    *   Significantly less than user testing. The primary cost is the time of the experts conducting the evaluation.
*   **How much severity is assigned? (The Severity Scale)**
    *   **0 = Bukan merupakan usability problem:** Tidak ada masalah usability yang berarti.
    *   **1 = Masalah kosmetik saja:** Dapat diperbaiki ketika ada waktu luang; contoh: typo, ejaan.
    *   **2 = Minor usability problem:** Perbaikan dengan prioritas rendah; contoh: style warna tidak konsisten, Bahasa.
    *   **3 = Major usability problem:** Menjadi prioritas utama untuk diperbaiki; contoh: fungsi utama dan journey utama.
    *   **4 = Usability catastrophe:** Sangat penting untuk diperbaiki sebelum dirilis; contoh: payment, add to cart, register.
