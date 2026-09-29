---
name: /peaches-practice
id: peaches-practice
category: Learning
description: "Hands-on security labs — find the vulnerability, build the primitive, harden the control, or read the evidence"
---

Use the peaches-practice skill to handle the user's /peaches-practice <concept-name> request.
Follow the workflow defined in the skill:
0. Pick the lab type for the concept (find it / build it / harden it / read the evidence / assess it / drive it) and state its blast radius — labs run locally or on a deliberately vulnerable target
1. Load context: match topic and concept from state.json (single source of truth) → check prerequisites
2. Assess difficulty level based on state.json concept fields (beginner/intermediate/challenge)
3. Files: use Bash to create the lab dir → use Write to create README.md (target, blast radius, how to run, success criteria) + the starter artefact → tell the user it runs locally
   Chat: run the lab in chat (context → one decision with a tradeoff → first step)
4. Review: use Read on the artefact (or the chat answer) → optionally run it → compose feedback → Write session file FIRST → echo file content verbatim to conversation + Edit state.json (last_practiced, practice_count, confidence, status) + run render.mjs
   Always close with the defence, the detection signal, and the single next action
