---
name: /peaches-quiz
id: peaches-quiz
category: Learning
description: "Quick text Q&A quiz — generates, grades, and saves a reusable question deck per concept"
---

Use the peaches-quiz skill to handle the user's /peaches:quiz <concept-or-domain> request.
Follow the single-flow workflow defined in the skill:
1. Load context: match topic and concept from state.json (single source of truth); default quizzes one concept, a domain or "all" quizzes each touched concept
2. Assess difficulty from each concept's confidence/status
3. Generate the full deck up front (~5-8 questions per concept, text types only: multiple_choice, multi_select, true_false, fill_in_blank, error_correction)
4. Write ONE reusable deck per concept under ./.peaches/topics/<topic>/quizzes/<concept-slug>/<concept-name>-quiz-<timestamp>.json (answers + explanations live only in the file)
5. Present all questions in chat WITHOUT answers; collect one batched reply
6. Grade by gradeable model (exact / accepted / ai_only) and give per-question feedback
7. Edit state.json per concept (only after grading) + run render.mjs
8. Recommend next steps; mention the deck is re-practiceable on the dashboard
