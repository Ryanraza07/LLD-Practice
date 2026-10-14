import test from 'node:test';
import assert from 'node:assert/strict';

import { problems, EvaluationEngine, getLLMConfig } from '../evaluator.js';

test('LLM configuration is resolved from environment settings', () => {
  const config = getLLMConfig();

  assert.ok(config.provider || config.apiKey || config.model);
  assert.ok(config.provider === 'groq' || config.provider === 'openai' || config.provider === 'custom');
});

test('evaluation scores are normalized to a 10-point scale', () => {
  const problem = problems[0];
  const solution = `
    class ParkingLot { allocateSlot(vehicle) { return this.floors[0].getAvailableSlot(vehicle); } }
    class ParkingFloor { addSlot(slot) {} }
    class ParkingSlot { isAvailable() { return true; } }
    class Vehicle { getType() { return 'Car'; } }
    class Ticket { constructor(vehicle) { this.vehicle = vehicle; } }
    class Gate { validateTicket(ticket) { return ticket; } }
    class PaymentService { calculateFee(vehicle, duration) { return 50; } }
  `;

  const result = new EvaluationEngine().evaluate(problem, solution);

  assert.ok(result.score >= 0);
  assert.ok(result.score <= 10);
  assert.ok(result.summary.includes('/10'));
});

test('parking lot strong solution covers expected classes and responsibilities', () => {
  const problem = problems[0];
  const solution = `
    class ParkingLot {
      allocateSlot(vehicle) { return this.floors[0].getAvailableSlot(vehicle); }
      addVehicle(vehicle) { ... }
    }
    class ParkingFloor { addSlot(slot) {} }
    class ParkingSlot { isAvailable() { return true; } }
    class Vehicle { getType() { return 'Car'; } }
    class Ticket { constructor(vehicle) { this.vehicle = vehicle; } }
    class Gate { validateTicket(ticket) { return ticket; } }
    class PaymentService { calculateFee(vehicle, duration) { return 50; } }
  `;

  const result = new EvaluationEngine().evaluate(problem, solution);

  assert.equal(result.status, 'Strong');
  assert.ok(result.score >= 7.5);
  assert.ok(result.coverage.some(item => item.name === 'ParkingLot' && item.present));
  assert.ok(result.feedback.includes('strong'));
});

test('missing core responsibilities produces actionable improvement feedback', () => {
  const problem = problems[1];
  const weakSolution = `
    class VendingMachine {
      dispense() { return 'item'; }
    }
  `;

  const result = new EvaluationEngine().evaluate(problem, weakSolution);

  assert.equal(result.status, 'Needs improvement');
  assert.ok(result.score < 6);
  assert.ok(result.missing.some(item => item.includes('Payment') || item.includes('Inventory')));
  assert.ok(result.suggestions.length > 0);
});

test('empty design is treated as incomplete and not scored as a valid attempt', () => {
  const problem = problems[2];
  const result = new EvaluationEngine().evaluate(problem, '   ');

  assert.equal(result.status, 'Incomplete');
  assert.equal(result.score, 0);
  assert.match(result.feedback, /No design/i);
});
