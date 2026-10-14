# Design note: MVP and evaluation strategy

## MVP concept

The prototype is a focused single-page LLD practice platform. It helps a learner work through a short design problem, submit a textual class design, and receive explainable feedback with a simple attempt history. The platform is intentionally small: it supports a few domain problems, a text-based submission form, and a deterministic evaluator with structured feedback.

### User flow

1. The learner selects a problem from a shortlist such as Parking Lot, Vending Machine, and Elevator System.
2. The app shows the requirements, domain goals, and the key responsibilities expected in a good design.
3. The learner writes a class-oriented design in plain text and submits it.
4. The system evaluates the submission, shows a score, and highlights strengths and missing responsibilities.
5. The learner can review previous attempts and improve the next design.

## Key domain model

The core classes are intentionally simple and map directly to the LLD practice domain. The product has a few central abstractions:

- ProblemCatalog: holds problem data and evaluation criteria.
- SubmissionDraft: captures the learner’s raw answer and chosen format.
- EvaluationEngine: checks whether important classes and responsibilities are present.
- AttemptHistoryStore: tracks prior attempts in local storage.
- FeedbackSummary: wraps the score, status, and next steps for the learner.

This is a minimal but extensible structure that keeps the LLD logic separated from the UI. That separation makes future changes easier, such as adding AI-based reasoning or replacing plain text with diagram input.

## Feedback approach

The evaluation model is intentionally hybrid:

- Deterministic checks: required class names, responsibility keywords, and structural coverage.
- Explainable narrative: a summary of what is strong, what is missing, and what should be improved.
- Future AI extension: a reasoned comparison between design trade-offs or an explanation of alternative class boundaries.

This reflects a practical answer to the question of what should be deterministic versus AI-assisted. Deterministic checks are good for objective signals such as the presence of a Ticket, PaymentService, or InventoryManager. AI is more useful for framing trade-offs, explaining why one design is easier to extend, and describing which responsibilities could be separated further.

## Trade-offs and extensibility

The prototype intentionally avoids a large backend or an asynchronous distributed evaluation service. Instead, it treats evaluation as a lightweight synchronous process with a short simulated delay and a clear error state if evaluation fails. That keeps the prototype realistic but practical.

The design is also open to extension. A later version could add new submission formats such as UML text, Mermaid diagrams, or a code editor. That would require a new SubmissionAdapter interface with a common output contract. The evaluation engine would remain mostly unchanged because it operates on structured domain signals rather than a single string format.

## Why this works for practice

The product is not trying to judge one perfect LLD answer. It is trying to support learning by making the missing parts visible. A learner can see whether their design cleanly covers the primary responsibilities, understand what weakens an answer, and progressively improve. That is the right product focus for an LLD practice experience.
