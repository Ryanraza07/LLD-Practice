import { problems, EvaluationEngine } from './evaluator.js';

const evaluationEngine = new EvaluationEngine();
const HISTORY_KEY = 'lld-attempt-history';

const refs = {
  problemList: document.getElementById('problem-list'),
  problemCount: document.getElementById('problem-count'),
  problemName: document.getElementById('problem-name'),
  problemSummary: document.getElementById('problem-summary'),
  problemGoals: document.getElementById('problem-goals'),
  solutionInput: document.getElementById('solution-input'),
  feedbackPanel: document.getElementById('feedback-panel'),
  statusBanner: document.getElementById('status-banner'),
  attemptHistory: document.getElementById('attempt-history'),
  submitButton: document.getElementById('submit-solution'),
  loadExampleButton: document.getElementById('load-example'),
  resetHistoryButton: document.getElementById('reset-history'),
  formatSelect: document.getElementById('submission-format')
};

let selectedProblem = problems[0];
let attempts = loadAttempts();

function loadAttempts() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveAttempts() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(attempts));
}

function getDraftKey(problemId) {
  return `lld-draft-${problemId}`;
}

function loadDraft(problemId) {
  try {
    return localStorage.getItem(getDraftKey(problemId)) || '';
  } catch (error) {
    return '';
  }
}

function saveDraft(problemId, text) {
  localStorage.setItem(getDraftKey(problemId), text);
}

function setStatus(message, type = 'info') {
  refs.statusBanner.className = `status-banner ${type}`;
  refs.statusBanner.textContent = message;
}

function renderProblemList() {
  refs.problemCount.textContent = `${problems.length} problems`;
  refs.problemList.innerHTML = problems.map((problem) => `
    <button
      class="problem-card ${problem.id === selectedProblem.id ? 'active' : ''}"
      type="button"
      data-problem-id="${problem.id}"
    >
      <span class="problem-card-top">
        <strong>${problem.title}</strong>
        <span class="difficulty">${problem.difficulty}</span>
      </span>
      <small>${problem.summary}</small>
    </button>
  `).join('');

  refs.problemList.querySelectorAll('.problem-card').forEach((button) => {
    button.addEventListener('click', () => {
      const nextProblem = problems.find((problem) => problem.id === button.dataset.problemId);
      if (!nextProblem) return;
      selectedProblem = nextProblem;
      renderProblemDetail();
      renderProblemList();
    });
  });
}

function renderProblemDetail() {
  refs.problemName.textContent = selectedProblem.title;
  refs.problemSummary.textContent = selectedProblem.summary;
  refs.problemGoals.innerHTML = selectedProblem.goals.map((goal) => `<li>${goal}</li>`).join('');

  refs.solutionInput.value = loadDraft(selectedProblem.id);
  refs.solutionInput.placeholder = `class ${selectedProblem.title.replace(/\s+/g, '')} { ... }\n\nclass ${selectedProblem.classes[0].name} { ... }`;
  refs.formatSelect.value = 'Text design';
  setStatus('Ready for a new design attempt.', 'info');
  refs.feedbackPanel.innerHTML = '';
}

function renderHistory() {
  if (!attempts.length) {
    refs.attemptHistory.innerHTML = '<p class="empty-state">No attempts yet. Your first submission will appear here.</p>';
    return;
  }

  refs.attemptHistory.innerHTML = attempts.map((attempt) => `
    <article class="history-item">
      <div class="history-head">
        <strong>${attempt.problemName}</strong>
        <span class="status-pill ${attempt.status.toLowerCase().replace(/\s+/g, '-')}">${attempt.status}</span>
      </div>
      <div class="meta-row">
        <span>${attempt.format}</span>
        <span>${attempt.score}/10</span>
      </div>
      <p>${attempt.feedback}</p>
      <time>${new Date(attempt.timestamp).toLocaleString()}</time>
    </article>
  `).join('');
}

function buildSample(problem) {
  if (problem.id === 'parking-lot') {
    return `class ParkingLot {
  constructor() {
    this.floors = [];
    this.gates = [];
  }

  allocateSlot(vehicle) {
    const floor = this.findSuitableFloor(vehicle);
    return floor.allocateSlot(vehicle);
  }
}

class ParkingFloor {
  constructor() {
    this.slots = [];
  }

  allocateSlot(vehicle) {
    const slot = this.slots.find(s => s.isAvailable() && s.isCompatible(vehicle));
    slot.markOccupied();
    return slot;
  }
}

class Vehicle {
  constructor(type) { this.type = type; }
}

class Ticket {
  constructor(vehicle, slot) {
    this.vehicle = vehicle;
    this.slot = slot;
    this.entryTime = Date.now();
  }
}

class Gate {
  validateTicket(ticket) {
    return ticket !== null;
  }
}

class PaymentService {
  calculateFee(vehicle, durationMinutes) {
    return durationMinutes * 10;
  }
}`;
  }

  if (problem.id === 'vending-machine') {
    return `class VendingMachine {
  constructor(inventory, paymentService) {
    this.inventory = inventory;
    this.paymentService = paymentService;
  }

  selectProduct(code) {
    const product = this.inventory.find(code);
    return product ? product : null;
  }
}

class Product {
  constructor(code, name, price, quantity) {
    this.code = code;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
  }
}

class InventoryManager {
  find(code) { return this.stock.get(code) || null; }
}

class CashBox {
  validatePayment(amount) {
    return amount > 0;
  }
}

class PaymentService {
  process(amount, product) {
    return amount >= product.price;
  }
}`;
  }

  return `class ElevatorController {
  constructor(building) {
    this.building = building;
    this.requests = [];
  }

  handleRequest(request) {
    this.requests.push(request);
    return this.schedule();
  }
}

class ElevatorCar {
  moveTo(floor) { return floor; }
}

class Dispatcher {
  schedule(requests) {
    return requests.sort((a, b) => a.floor - b.floor);
  }
}

class FloorRequest {
  constructor(floor, direction) {
    this.floor = floor;
    this.direction = direction;
  }
}`;
}

async function handleSubmit() {
  const responseText = refs.solutionInput.value.trim();

  if (!responseText) {
    setStatus('Please write a design before submitting.', 'error');
    return;
  }

  refs.submitButton.disabled = true;
  setStatus('Evaluating design...', 'pending');

  try {
    const evaluateUrl = window.location.port === '3000'
      ? `${window.location.origin}/api/evaluate`
      : 'http://localhost:3000/api/evaluate';

    const response = await fetch(evaluateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        problemId: selectedProblem.id,
        submissionText: responseText
      })
    });

    if (!response.ok) {
      throw new Error(`Evaluation API returned ${response.status}`);
    }

    const result = await response.json();

    const attempt = {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      problemId: selectedProblem.id,
      problemName: selectedProblem.title,
      format: refs.formatSelect.value,
      score: result.score,
      status: result.status,
      feedback: result.feedback,
      timestamp: new Date().toISOString()
    };

    attempts.unshift(attempt);
    saveAttempts();
    renderHistory();
    renderFeedback(result);
    setStatus(`Attempt saved: ${result.status} (${result.score}/10)`, result.status === 'Strong' ? 'success' : 'info');
    saveDraft(selectedProblem.id, responseText);
  } catch (error) {
    console.error(error);
    const fallbackResult = evaluationEngine.evaluate(selectedProblem, responseText);

    const attempt = {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      problemId: selectedProblem.id,
      problemName: selectedProblem.title,
      format: refs.formatSelect.value,
      score: fallbackResult.score,
      status: fallbackResult.status,
      feedback: fallbackResult.feedback,
      timestamp: new Date().toISOString()
    };

    attempts.unshift(attempt);
    saveAttempts();
    renderHistory();
    renderFeedback(fallbackResult);
    setStatus('Evaluation failed. Please retry with the same design.', 'error');
    refs.feedbackPanel.innerHTML = `
      <div class="feedback-card error-card">
        <h3>Evaluation error</h3>
        <p>The evaluator could not complete the review. Your draft is still saved so you can retry.</p>
      </div>
    `;
  } finally {
    refs.submitButton.disabled = false;
  }
}

function renderFeedback(result) {
  const strengths = result.strengths && result.strengths.length
    ? result.strengths
    : ['core domain model'];

  const missing = result.missing && result.missing.length
    ? result.missing.slice(0, 4)
    : ['No obvious gaps detected'];

  refs.feedbackPanel.innerHTML = `
    <div class="feedback-card">
      <div class="feedback-head">
        <span class="score-badge">${result.score}/10</span>
        <span class="status-pill ${result.status.toLowerCase().replace(/\s+/g, '-')}">${result.status}</span>
      </div>
      <p class="coach-summary">${result.feedback}</p>
      <div class="feedback-grid">
        <section>
          <h3>Strengths</h3>
          <ul>
            ${strengths.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </section>
        <section>
          <h3>Missing</h3>
          <ul>
            ${missing.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </section>
      </div>
      <section>
        <h3>Next steps</h3>
        <ul>
          ${result.suggestions.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </section>
    </div>
  `;
}

function clearHistory() {
  attempts = [];
  saveAttempts();
  renderHistory();
  setStatus('Attempt history cleared.', 'info');
}

refs.submitButton.addEventListener('click', handleSubmit);
refs.loadExampleButton.addEventListener('click', () => {
  refs.solutionInput.value = buildSample(selectedProblem);
  saveDraft(selectedProblem.id, refs.solutionInput.value);
  setStatus('Sample design loaded. Review it and submit when ready.', 'info');
});
refs.resetHistoryButton.addEventListener('click', clearHistory);
refs.solutionInput.addEventListener('input', () => {
  saveDraft(selectedProblem.id, refs.solutionInput.value);
});

renderProblemList();
renderProblemDetail();
renderHistory();
setStatus('Pick a problem and start your design.', 'info');

window.addEventListener('storage', () => {
  attempts = loadAttempts();
  renderHistory();
});
