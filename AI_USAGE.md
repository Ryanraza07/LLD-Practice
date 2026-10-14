# AI usage

This project used AI in a few focused and practical ways:

1. Problem framing and product direction. I asked the AI to help clarify the MVP boundary and the learner journey behind the assignment. It suggested focusing on a small practice loop rather than a full LMS or large assessment platform. I accepted this because it kept the product centered on actual LLD learning rather than administrative overhead.

2. Feedback rubric design. I used AI to help structure what a learner should be evaluated on: domain coverage, class responsibility clarity, edge-case handling, and reviewable trade-offs. I kept most of the actual scoring logic deterministic because LLD feedback needs to be explainable and repeatable.

3. Evaluation narrative. I used AI to shape the phrasing of the coach-style feedback so it sounds helpful and actionable rather than generic. I accepted the idea of a structured feedback template, but I rejected a fully black-box AI evaluation because the product should remain deterministic and transparent for an MVP.

4. Edge-case and test design. AI was useful in listing failure states like missing submissions, weak designs, and incomplete responsibility coverage. I used those ideas to test the platform’s real behavior and validate that the feedback is genuine and not just surface-level.

Overall, the AI helped sharpen the product concept and reduce uncertainty, but the final implementation and judgment stayed grounded in the assignment goals: learner-centered practice, clear class responsibilities, explainable feedback, and a clean extensibility path.
