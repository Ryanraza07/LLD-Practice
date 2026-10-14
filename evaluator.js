let fsModule = null;
let pathModule = null;
let fileURLToPath = null;

try {
  if (typeof process !== 'undefined' && process.versions?.node) {
    fsModule = await import('node:fs');
    pathModule = await import('node:path');
    const urlModule = await import('node:url');
    fileURLToPath = urlModule.fileURLToPath;
  }
} catch (error) {
  fsModule = null;
  pathModule = null;
  fileURLToPath = null;
}

const __filename = fileURLToPath ? fileURLToPath(import.meta.url) : '';
const __dirname = __filename && pathModule ? pathModule.dirname(__filename) : '';

export const problems = [
  {
    id: 'parking-lot',
    title: 'Parking Lot',
    difficulty: 'Medium',
    summary: 'Design a parking lot that accepts vehicles, allocates valid slots, and charges for duration. Keep the design extensible for multiple floors and vehicle types.',
    goals: [
      'Reason about allocation and admission rules.',
      'Separate state from operations and free slots from pricing logic.',
      'Keep the design open for new vehicle categories and gates.'
    ],
    classes: [
      { name: 'ParkingLot', keywords: ['parkinglot', 'lot', 'parking', 'allocate', 'slot'] },
      { name: 'ParkingFloor', keywords: ['floor', 'levels', 'rows', 'slots'] },
      { name: 'ParkingSlot', keywords: ['slot', 'availability', 'vacant', 'occupied'] },
      { name: 'Vehicle', keywords: ['vehicle', 'car', 'truck', 'bike', 'type'] },
      { name: 'Ticket', keywords: ['ticket', 'entry', 'receipt', 'assigned'] },
      { name: 'Gate', keywords: ['gate', 'entry', 'exit', 'validate'] },
      { name: 'PaymentService', keywords: ['payment', 'fee', 'pricing', 'charge'] }
    ],
    responsibilities: [
      { label: 'Capacity management', keywords: ['capacity', 'available', 'full', 'allocate', 'free'] },
      { label: 'Vehicle-type rules', keywords: ['vehicle type', 'bike', 'car', 'truck', 'eligibility'] },
      { label: 'Ticket generation', keywords: ['ticket', 'entry ticket', 'receipt', 'generate'] },
      { label: 'Exit and payment', keywords: ['exit', 'payment', 'fee', 'checkout', 'charge'] }
    ]
  },
  {
    id: 'vending-machine',
    title: 'Vending Machine',
    difficulty: 'Medium',
    summary: 'Design a vending machine that dispenses products, handles cash and change, and prevents invalid transactions.',
    goals: [
      'Model inventory and product selection clearly.',
      'Decide where validation belongs.',
      'Handle cash state and the edge cases around insufficient funds.'
    ],
    classes: [
      { name: 'VendingMachine', keywords: ['vendingmachine', 'machine', 'dispense', 'select'] },
      { name: 'InventoryManager', keywords: ['inventory', 'stock', 'quantity', 'count'] },
      { name: 'Product', keywords: ['product', 'item', 'sku', 'price'] },
      { name: 'CashBox', keywords: ['cash', 'coin', 'banknote', 'change'] },
      { name: 'PaymentService', keywords: ['payment', 'validate', 'paymentservice', 'amount'] },
      { name: 'UserSession', keywords: ['session', 'transaction', 'cart', 'current'] }
    ],
    responsibilities: [
      { label: 'Inventory tracking', keywords: ['inventory', 'stock', 'quantity', 'available', 'restock'] },
      { label: 'Payment validation', keywords: ['payment', 'validate', 'sufficient', 'funds', 'change'] },
      { label: 'Dispense flow', keywords: ['dispense', 'drop', 'deliver', 'transaction'] },
      { label: 'Failure handling', keywords: ['error', 'invalid', 'out of stock', 'refund'] }
    ]
  },
  {
    id: 'elevator-system',
    title: 'Elevator System',
    difficulty: 'Hard',
    summary: 'Design a building elevator system with multiple floors, direction control, and requests from passengers.',
    goals: [
      'Balance user experience with scheduler logic.',
      'Separate request collection from control decisions.',
      'Handle delayed or repeated requests without making the controller too complex.'
    ],
    classes: [
      { name: 'ElevatorController', keywords: ['controller', 'scheduler', 'move', 'direction'] },
      { name: 'ElevatorCar', keywords: ['elevator', 'car', 'door', 'floor'] },
      { name: 'FloorRequest', keywords: ['request', 'floor request', 'destination', 'pickup'] },
      { name: 'Dispatcher', keywords: ['dispatcher', 'assign', 'schedule', 'queue'] },
      { name: 'Building', keywords: ['building', 'floors', 'levels', 'layout'] }
    ],
    responsibilities: [
      { label: 'Request collection', keywords: ['request', 'queue', 'pickup', 'destination'] },
      { label: 'Door and movement logic', keywords: ['move', 'door', 'open', 'close', 'floor'] },
      { label: 'Scheduling decisions', keywords: ['schedule', 'nearest', 'direction', 'prioritize'] },
      { label: 'Concurrency safety', keywords: ['thread', 'lock', 'state', 'synchronized'] }
    ]
  }
];

function parseEnvValue(rawValue) {
  const value = rawValue.trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function loadDotEnv(filePath = pathModule ? pathModule.join(__dirname, '.env') : '') {
  if (!fsModule || !filePath) {
    return {};
  }

  try {
    const fileText = fsModule.readFileSync(filePath, 'utf8');
    const environment = {};

    for (const line of fileText.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

      const separatorIndex = trimmed.indexOf('=');
      const key = trimmed.slice(0, separatorIndex).trim();
      const value = parseEnvValue(trimmed.slice(separatorIndex + 1).trim());
      if (key) {
        environment[key] = value;
      }
    }

    return environment;
  } catch (error) {
    return {};
  }
}

export function getLLMConfig() {
  const dotEnv = loadDotEnv();
  const provider = (process.env.LLM_PROVIDER || dotEnv.LLM_PROVIDER || 'groq').toLowerCase();
  const apiKey = process.env.LLM_API_KEY || process.env.GROQ_API_KEY || dotEnv.LLM_API_KEY || dotEnv.GROQ_API_KEY || '';
  const model = process.env.LLM_MODEL || dotEnv.LLM_MODEL || 'qwen/qwen3.8-27b';
  const baseUrl = process.env.LLM_BASE_URL || dotEnv.LLM_BASE_URL || 'https://api.groq.com/openai/v1';
  const temperature = Number(process.env.LLM_TEMPERATURE ?? dotEnv.LLM_TEMPERATURE ?? 0.2);

  return {
    provider,
    apiKey,
    model,
    baseUrl,
    temperature: Number.isFinite(temperature) ? temperature : 0.2
  };
}

function parseStructuredAIResponse(responseText) {
  const text = String(responseText || '').trim();
  if (!text) return null;

  const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    return JSON.parse(stripped);
  } catch (error) {
    const scoreMatch = stripped.match(/score\s*[:=]?\s*(\d{1,3})/i);
    const statusMatch = stripped.match(/status\s*[:=]?\s*([A-Za-z ]+)/i);
    const summaryMatch = stripped.match(/summary\s*[:=]?\s*([^\n]+)/i);

    if (!scoreMatch && !statusMatch) return null;

    return {
      score: scoreMatch ? Number(scoreMatch[1]) : null,
      status: statusMatch ? statusMatch[1].trim() : null,
      summary: summaryMatch ? summaryMatch[1].trim() : null,
      feedback: stripped
    };
  }
}

export class EvaluationEngine {
  evaluate(problem, submissionText = '') {
    const text = String(submissionText || '').trim();

    if (!text) {
      return {
        status: 'Incomplete',
        score: 0,
        coverage: [],
        missing: ['No design submitted yet. Add classes, responsibilities, and key interactions.'],
        suggestions: [
          'List the primary classes and their responsibilities.',
          'Describe how requests move between objects.',
          'Call out edge cases like invalid input or full capacity.'
        ],
        feedback: 'No design submitted yet. Add the main entities and the interaction flow before submitting again.',
        summary: 'Incomplete attempt'
      };
    }

    const normalized = text.toLowerCase();

    const coverage = problem.classes.map((entry) => {
      const match = entry.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
      return {
        name: entry.name,
        present: match
      };
    });

    const responsibilityResults = problem.responsibilities.map((item) => {
      const match = item.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
      return {
        name: item.label,
        present: match
      };
    });

    const covered = [...coverage, ...responsibilityResults].filter((item) => item.present).length;
    const total = coverage.length + responsibilityResults.length;
    const percentScore = Math.round((covered / total) * 100);
    const score = Number((percentScore / 10).toFixed(1));

    const missing = [...coverage.filter((item) => !item.present).map((item) => item.name), ...responsibilityResults.filter((item) => !item.present).map((item) => item.name)];
    const coveredNames = coverage.filter((item) => item.present).map((item) => item.name);
    const topStrengths = coveredNames.length > 0 ? coveredNames.slice(0, 3) : ['domain model'];

    let status = 'Weak';
    if (score >= 7.5) status = 'Strong';
    else if (score >= 3) status = 'Needs improvement';
    else status = 'Weak';

    const suggestions = [
      'Clarify the main responsibilities in each class.',
      'Add the interaction flow between entities for entry, validation, and exit.',
      'Explain how edge cases like invalid input, full state, or time-based rules are handled.'
    ];

    const designNarrative =
      score >= 7.5
        ? `This design is strong because it covers the main domain model and responsibilities: ${topStrengths.join(', ')}.`
        : `This design is still missing important LLD details. The submission needs more clarity around: ${missing.slice(0, 3).join(', ')}.`;

    return {
      status,
      score,
      coverage,
      missing,
      suggestions,
      feedback: `${designNarrative} ${score >= 7.5 ? 'Keep the responsibilities crisp, and consider the trade-offs around extensibility and validation.' : 'Refine your class boundaries and add explicit flow for the highest-risk conditions.'}`,
      summary: `${problem.title} evaluation: ${status} (${score}/10)`,
      strengths: topStrengths,
      requirementCoverage: covered,
      totalRequirements: total
    };
  }

  async evaluateWithLLM(problem, submissionText = '') {
    const fallback = this.evaluate(problem, submissionText);
    const config = getLLMConfig();

    if (!config.apiKey || !config.baseUrl || !globalThis.fetch) {
      return fallback;
    }

    try {
      const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          temperature: config.temperature,
          messages: [
            {
              role: 'system',
              content: 'You are an expert low-level design evaluator. Return only valid JSON with keys: status, score, feedback, strengths, suggestions, missing, summary.'
            },
            {
              role: 'user',
              content: `Evaluate this LLD submission for the problem "${problem.title}".\n\nProblem summary: ${problem.summary}\n\nGoals:\n${problem.goals.join('\n')}\n\nClasses to cover:\n${problem.classes.map((entry) => entry.name).join(', ')}\n\nResponsibilities to cover:\n${problem.responsibilities.map((item) => item.label).join(', ')}\n\nSubmission:\n${submissionText}`
            }
          ]
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('LLM provider rejected the request:', errorBody);
        return {
          ...fallback,
          feedback: `${fallback.feedback} (LLM provider rejected the request: ${errorBody.slice(0, 200)})`,
          summary: `${fallback.summary} [LLM fallback]`
        };
      }

      const data = await response.json();
      const rawText = data?.choices?.[0]?.message?.content;
      const parsed = parseStructuredAIResponse(rawText);

      if (!parsed) {
        return fallback;
      }

      const status = ['Strong', 'Needs improvement', 'Weak'].includes(parsed.status)
        ? parsed.status
        : fallback.status;
      const normalizedScore = Number.isFinite(Number(parsed.score)) ? Number(parsed.score) : fallback.score;
      const score = Math.min(10, Math.max(0, normalizedScore));
      const strengths = Array.isArray(parsed.strengths) && parsed.strengths.length
        ? parsed.strengths
        : fallback.strengths;
      const missing = Array.isArray(parsed.missing) && parsed.missing.length
        ? parsed.missing
        : fallback.missing;
      const suggestions = Array.isArray(parsed.suggestions) && parsed.suggestions.length
        ? parsed.suggestions
        : fallback.suggestions;

      return {
        status,
        score,
        coverage: fallback.coverage,
        missing,
        suggestions,
        feedback: parsed.feedback || parsed.summary || fallback.feedback,
        summary: parsed.summary || `${problem.title} evaluation: ${status} (${score}/10)`,
        strengths,
        requirementCoverage: fallback.requirementCoverage,
        totalRequirements: fallback.totalRequirements
      };
    } catch (error) {
      return fallback;
    }
  }
}
