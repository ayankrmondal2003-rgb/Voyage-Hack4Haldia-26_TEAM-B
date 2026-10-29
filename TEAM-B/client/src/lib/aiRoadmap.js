// Comprehensive AI Roadmap & Idea Synthesis Engine for TEAM-B Whiteboard

const PRESET_TOPICS = {
  'fullstack': {
    title: 'Full-Stack Web Application',
    phases: [
      {
        title: 'Phase 1: Architecture & Data',
        color: '#bbf7d0', // Mint
        tasks: ['Define schema & models in MongoDB', 'Setup Express REST & WebSocket API', 'CORS, security & rate limiting']
      },
      {
        title: 'Phase 2: Core Frontend UI',
        color: '#e0f2fe', // Sky Blue
        tasks: ['React 19 + Vite scaffolding', 'High-DPI Canvas 2D engine', 'State sync & responsive layout']
      },
      {
        title: 'Phase 3: Real-Time Sync',
        color: '#fef08a', // Yellow
        tasks: ['Socket.IO room isolation', 'Sub-30ms stroke streaming', 'Outbox retry & reconciliation']
      },
      {
        title: 'Phase 4: Testing & Hardening',
        color: '#fca5a5', // Coral
        tasks: ['Node.js native test runner suite', 'Per-user undo/redo ownership', 'DPI scaling & coordinate math']
      },
      {
        title: 'Phase 5: Production Launch',
        color: '#f3e8ff', // Lavender
        tasks: ['Render cloud web service deployment', 'Atlas IP whitelist configuration', 'Live collaborative demo']
      }
    ]
  },
  'ai-agent': {
    title: 'Autonomous AI Agent System',
    phases: [
      {
        title: 'Phase 1: Problem & Scope',
        color: '#bbf7d0',
        tasks: ['Define agent persona & objective', 'Identify input/output payloads', 'Select LLM foundation & tokenizer']
      },
      {
        title: 'Phase 2: Tooling & Sandbox',
        color: '#e0f2fe',
        tasks: ['Implement MCP tool protocols', 'Safe execution sandbox environment', 'Context window management']
      },
      {
        title: 'Phase 3: Reasoning & Memory',
        color: '#fef08a',
        tasks: ['Chain-of-thought prompt design', 'Vector embeddings & RAG retrieval', 'Multi-turn conversation state']
      },
      {
        title: 'Phase 4: Multi-Agent Swarm',
        color: '#fca5a5',
        tasks: ['Subagent delegation protocol', 'Orchestration & consensus engine', 'Hallucination verification guardrails']
      },
      {
        title: 'Phase 5: Deployment & Eval',
        color: '#f3e8ff',
        tasks: ['Latency benchmarking & caching', 'E2E benchmark test evaluation', 'Production monitoring dashboard']
      }
    ]
  },
  'hackathon': {
    title: 'Hackathon 24hr MVP Sprint',
    phases: [
      {
        title: 'Hour 0–4: Ideation & Setup',
        color: '#bbf7d0',
        tasks: ['Align team on core user problem', 'Clone starter repo & configure git', 'Deploy basic hello-world to cloud']
      },
      {
        title: 'Hour 4–12: Core Feature Build',
        color: '#e0f2fe',
        tasks: ['Implement mandatory user flow', 'Build minimal viable canvas UI', 'Wire backend database persistence']
      },
      {
        title: 'Hour 12–18: Polish & Bonus',
        color: '#fef08a',
        tasks: ['Add standout feature (AI Roadmap)', 'Per-user undo & cursor tracking', 'Neo-brutalist tactile styling']
      },
      {
        title: 'Hour 18–22: QA & Hardening',
        color: '#fca5a5',
        tasks: ['Run all unit & integration tests', 'Test on mobile & incognito tabs', 'Prepare 2-minute live demo script']
      },
      {
        title: 'Hour 22–24: Pitch & Submit',
        color: '#f3e8ff',
        tasks: ['Record video backup walkthrough', 'Submit PR & OrganizerHQ forms', 'Deliver winning presentation']
      }
    ]
  },
  'mobile-app': {
    title: 'Mobile App Launch',
    phases: [
      {
        title: 'Phase 1: UX Wireframes',
        color: '#bbf7d0',
        tasks: ['User journey & wireframing', 'Design system & tactile palette', 'Clickable prototype user testing']
      },
      {
        title: 'Phase 2: App Foundation',
        color: '#e0f2fe',
        tasks: ['React Native / Flutter scaffold', 'Global state & local storage', 'OAuth / social login integration']
      },
      {
        title: 'Phase 3: Backend & Sync',
        color: '#fef08a',
        tasks: ['Cloud database & REST endpoints', 'Push notifications pipeline', 'Offline data sync & caching']
      },
      {
        title: 'Phase 4: Device Testing',
        color: '#fca5a5',
        tasks: ['iOS TestFlight distribution', 'Android internal testing track', 'Performance profiling & 60fps']
      },
      {
        title: 'Phase 5: App Store Release',
        color: '#f3e8ff',
        tasks: ['App Store review submission', 'Play Store listing & screenshots', 'Analytics & user crash tracking']
      }
    ]
  },
  'saas': {
    title: 'B2B SaaS Architecture',
    phases: [
      {
        title: 'Phase 1: Market Validation',
        color: '#bbf7d0',
        tasks: ['Interview 10 target customers', 'Validate willingness-to-pay', 'Define MVP feature boundaries']
      },
      {
        title: 'Phase 2: Multi-Tenant Core',
        color: '#e0f2fe',
        tasks: ['Tenant database isolation', 'Role-based access control (RBAC)', 'Subscription billing (Stripe API)']
      },
      {
        title: 'Phase 3: High-Value Workflow',
        color: '#fef08a',
        tasks: ['Collaborative team workspaces', 'Automated reporting & exports', 'Webhook integrations & public API']
      },
      {
        title: 'Phase 4: Security & Compliance',
        color: '#fca5a5',
        tasks: ['Data encryption at rest & transit', 'Audit logging & rate limiting', 'SOC2 / GDPR readiness checklist']
      },
      {
        title: 'Phase 5: GTM & Scaled Launch',
        color: '#f3e8ff',
        tasks: ['SEO landing page & blog', 'Self-serve onboarding flow', 'Customer success & feedback loop']
      }
    ]
  }
};

/**
 * Intelligently generates structured roadmap or mindmap data for any query.
 */
export function synthesizePlan({ topic, mode = 'roadmap' }) {
  const query = (topic || '').trim().toLowerCase();

  // 1. Check for preset keyword matches
  let presetKey = null;
  if (/fullstack|web\s*dev|mern|react|node|javascript/i.test(query)) presetKey = 'fullstack';
  else if (/ai|agent|llm|gpt|model|machine\s*learn/i.test(query)) presetKey = 'ai-agent';
  else if (/hackathon|sprint|24|mvp/i.test(query)) presetKey = 'hackathon';
  else if (/mobile|ios|android|flutter|react\s*native/i.test(query)) presetKey = 'mobile-app';
  else if (/saas|b2b|startup|business|platform/i.test(query)) presetKey = 'saas';

  if (presetKey && PRESET_TOPICS[presetKey]) {
    const p = PRESET_TOPICS[presetKey];
    if (mode === 'mindmap') {
      return createMindmapFromPhases(p.title, p.phases);
    }
    return { title: p.title, phases: p.phases, mode: 'roadmap' };
  }

  // 2. Dynamic Semantic Synthesis for any custom topic
  const cleanTitle = (topic || 'Project Roadmap').replace(/^\w/, c => c.toUpperCase());
  
  if (mode === 'mindmap') {
    return {
      title: cleanTitle,
      mode: 'mindmap',
      center: {
        title: `💡 ${cleanTitle}`,
        subtitle: 'Core Concept & Strategy',
        color: '#fef08a'
      },
      satellites: [
        {
          title: '👥 Target Audience',
          color: '#bbf7d0',
          tasks: ['Primary end-users & personas', 'Core user pain points', 'Adoption barriers & solutions']
        },
        {
          title: '⚡ Core Value & Features',
          color: '#e0f2fe',
          tasks: ['Unique selling proposition', 'Key killer feature workflows', 'Real-time collaborative aspect']
        },
        {
          title: '🛠️ Architecture & Tech',
          color: '#fca5a5',
          tasks: ['Modern modular stack choice', 'Data persistence & sync engine', 'API security & scalability']
        },
        {
          title: '📈 Impact & Next Steps',
          color: '#f3e8ff',
          tasks: ['Key milestone measurements', 'User feedback & iterations', 'Horizontal scaling expansion']
        }
      ]
    };
  }

  // Dynamic 5-phase roadmap for open topics
  return {
    title: cleanTitle,
    mode: 'roadmap',
    phases: [
      {
        title: `Phase 1: Research & Scope`,
        color: '#bbf7d0',
        tasks: [`Define requirements for ${cleanTitle}`, 'Competitor & workflow analysis', 'Technical feasibility study']
      },
      {
        title: `Phase 2: Foundation & Prototype`,
        color: '#e0f2fe',
        tasks: ['Design core system architecture', 'Build minimal working prototype', 'Establish base state & storage']
      },
      {
        title: `Phase 3: Core Implementation`,
        color: '#fef08a',
        tasks: ['Build interactive features', 'Integrate real-time data pipelines', 'Refine user interface & polish']
      },
      {
        title: `Phase 4: Validation & Testing`,
        color: '#fca5a5',
        tasks: ['Edge case & load testing', 'User feedback & usability tweaks', 'Reliability & reconnect checks']
      },
      {
        title: `Phase 5: Launch & Presentation`,
        color: '#f3e8ff',
        tasks: ['Live cloud deployment', 'Demonstrate to stakeholders', 'Plan future enhancement roadmap']
      }
    ]
  };
}

function createMindmapFromPhases(title, phases) {
  return {
    title,
    mode: 'mindmap',
    center: {
      title: `💡 ${title}`,
      subtitle: 'Central Hub & Brainstorm',
      color: '#fef08a'
    },
    satellites: phases.slice(0, 4).map((p, idx) => ({
      title: p.title.replace(/^Phase\s*\d+:\s*/, ''),
      color: p.color,
      tasks: p.tasks
    }))
  };
}

/**
 * Converts synthesized plan into native whiteboard canvas elements
 * conforming strictly to shared/protocol.js element validation.
 */
export function generateCanvasElements(plan, { centerX = 400, centerY = 300, roomId, authorId }) {
  const elements = [];
  const now = new Date().toISOString();

  if (plan.mode === 'mindmap') {
    // ------------------------------------------------------------------
    // MINDMAP LAYOUT: Central hub with 4 radiating satellite cards
    // ------------------------------------------------------------------
    const hubW = 280;
    const hubH = 100;
    const hubX = centerX - hubW / 2;
    const hubY = centerY - hubH / 2;

    // Hub card (Rectangle)
    const hubCardId = crypto.randomUUID();
    elements.push({
      id: hubCardId,
      roomId,
      authorId,
      tool: 'rectangle',
      type: 'rectangle',
      x: hubX,
      y: hubY,
      w: hubW,
      h: hubH,
      points: [[hubX, hubY], [hubX + hubW, hubY + hubH]],
      fillColor: plan.center.color || '#fef08a',
      color: '#000000',
      strokeColor: '#000000',
      width: 3,
      strokeWidth: 3,
      createdAt: now,
      active: true
    });

    // Hub title (Text)
    elements.push({
      id: crypto.randomUUID(),
      roomId,
      authorId,
      tool: 'text',
      type: 'text',
      x: hubX + 16,
      y: hubY + 34,
      text: plan.center.title,
      fontSize: 18,
      color: '#000000',
      strokeColor: '#000000',
      createdAt: now,
      active: true
    });

    // Hub subtitle (Text)
    elements.push({
      id: crypto.randomUUID(),
      roomId,
      authorId,
      tool: 'text',
      type: 'text',
      x: hubX + 16,
      y: hubY + 68,
      text: plan.center.subtitle,
      fontSize: 13,
      color: '#4b5563',
      strokeColor: '#4b5563',
      createdAt: now,
      active: true
    });

    // Satellites positions: [Top-Left, Top-Right, Bottom-Left, Bottom-Right]
    const satW = 250;
    const satH = 135;
    const offsetX = 360;
    const offsetY = 190;

    const satPositions = [
      { x: centerX - offsetX - satW / 2, y: centerY - offsetY - satH / 2 },
      { x: centerX + offsetX - satW / 2, y: centerY - offsetY - satH / 2 },
      { x: centerX - offsetX - satW / 2, y: centerY + offsetY - satH / 2 },
      { x: centerX + offsetX - satW / 2, y: centerY + offsetY - satH / 2 }
    ];

    plan.satellites.forEach((sat, i) => {
      const pos = satPositions[i] || satPositions[0];

      // Satellite Card (Rectangle)
      const satCardId = crypto.randomUUID();
      elements.push({
        id: satCardId,
        roomId,
        authorId,
        tool: 'rectangle',
        type: 'rectangle',
        x: pos.x,
        y: pos.y,
        w: satW,
        h: satH,
        points: [[pos.x, pos.y], [pos.x + satW, pos.y + satH]],
        fillColor: sat.color || '#e0f2fe',
        color: '#000000',
        strokeColor: '#000000',
        width: 2.5,
        strokeWidth: 2.5,
        createdAt: now,
        active: true
      });

      // Satellite Title (Text)
      elements.push({
        id: crypto.randomUUID(),
        roomId,
        authorId,
        tool: 'text',
        type: 'text',
        x: pos.x + 14,
        y: pos.y + 26,
        text: sat.title,
        fontSize: 15,
        color: '#000000',
        strokeColor: '#000000',
        createdAt: now,
        active: true
      });

      // Satellite Tasks (Text)
      elements.push({
        id: crypto.randomUUID(),
        roomId,
        authorId,
        tool: 'text',
        type: 'text',
        x: pos.x + 14,
        y: pos.y + 54,
        text: (sat.tasks || []).map(t => `• ${t}`).join('\n'),
        fontSize: 12,
        color: '#1f2937',
        strokeColor: '#1f2937',
        createdAt: now,
        active: true
      });

      // Connecting Arrow from Hub to Satellite
      const hubEdgeX = pos.x < hubX ? hubX : hubX + hubW;
      const hubEdgeY = pos.y < hubY ? hubY + 20 : hubY + hubH - 20;
      const satEdgeX = pos.x < hubX ? pos.x + satW : pos.x;
      const satEdgeY = pos.y + satH / 2;

      elements.push({
        id: crypto.randomUUID(),
        roomId,
        authorId,
        tool: 'arrow',
        type: 'arrow',
        points: [
          [hubEdgeX, hubEdgeY],
          [satEdgeX, satEdgeY]
        ],
        color: '#000000',
        strokeColor: '#000000',
        width: 2.5,
        strokeWidth: 2.5,
        createdAt: now,
        active: true
      });
    });

    return elements;
  }

  // ------------------------------------------------------------------
  // ROADMAP TIMELINE: Horizontal Left-to-Right Flow with Connecting Arrows
  // ------------------------------------------------------------------
  const cardW = 260;
  const cardH = 150;
  const gap = 80;
  const totalW = plan.phases.length * cardW + (plan.phases.length - 1) * gap;
  const startX = centerX - totalW / 2;
  const startY = centerY - cardH / 2;

  // Title Banner at the top
  elements.push({
    id: crypto.randomUUID(),
    roomId,
    authorId,
    tool: 'text',
    type: 'text',
    x: startX,
    y: startY - 50,
    text: `🚀 ROADMAP: ${plan.title.toUpperCase()}`,
    fontSize: 22,
    color: '#000000',
    strokeColor: '#000000',
    createdAt: now,
    active: true
  });

  const cards = [];

  plan.phases.forEach((phase, i) => {
    const cardX = startX + i * (cardW + gap);
    const cardY = startY;
    cards.push({ cardX, cardY, cardW, cardH });

    // Phase Card (Rectangle)
    const cardId = crypto.randomUUID();
    elements.push({
      id: cardId,
      roomId,
      authorId,
      tool: 'rectangle',
      type: 'rectangle',
      x: cardX,
      y: cardY,
      w: cardW,
      h: cardH,
      points: [[cardX, cardY], [cardX + cardW, cardY + cardH]],
      fillColor: phase.color,
      color: '#000000',
      strokeColor: '#000000',
      width: 2.5,
      strokeWidth: 2.5,
      createdAt: now,
      active: true
    });

    // Phase Title (Text)
    elements.push({
      id: crypto.randomUUID(),
      roomId,
      authorId,
      tool: 'text',
      type: 'text',
      x: cardX + 14,
      y: cardY + 28,
      text: phase.title,
      fontSize: 15,
      color: '#000000',
      strokeColor: '#000000',
      createdAt: now,
      active: true
    });

    // Phase Tasks (Text)
    elements.push({
      id: crypto.randomUUID(),
      roomId,
      authorId,
      tool: 'text',
      type: 'text',
      x: cardX + 14,
      y: cardY + 58,
      text: (phase.tasks || []).map(t => `• ${t}`).join('\n'),
      fontSize: 12,
      color: '#1f2937',
      strokeColor: '#1f2937',
      createdAt: now,
      active: true
    });
  });

  // Connecting Arrows between consecutive phases
  for (let i = 0; i < cards.length - 1; i++) {
    const c1 = cards[i];
    const c2 = cards[i + 1];

    elements.push({
      id: crypto.randomUUID(),
      roomId,
      authorId,
      tool: 'arrow',
      type: 'arrow',
      points: [
        [c1.cardX + c1.cardW + 5, c1.cardY + c1.cardH / 2],
        [c2.cardX - 5, c2.cardY + c2.cardH / 2]
      ],
      color: '#000000',
      strokeColor: '#000000',
      width: 3,
      strokeWidth: 3,
      createdAt: now,
      active: true
    });
  }

  // Final Success Badge (Ellipse)
  const lastCard = cards[cards.length - 1];
  const goalX = lastCard.cardX + lastCard.cardW + 70;
  const goalY = lastCard.cardY + lastCard.cardH / 2 - 40;

  // Arrow to Goal
  elements.push({
    id: crypto.randomUUID(),
    roomId,
    authorId,
    tool: 'arrow',
    type: 'arrow',
    points: [
      [lastCard.cardX + lastCard.cardW + 5, lastCard.cardY + lastCard.cardH / 2],
      [goalX - 5, lastCard.cardY + lastCard.cardH / 2]
    ],
    color: '#000000',
    strokeColor: '#000000',
    width: 3,
    strokeWidth: 3,
    createdAt: now,
    active: true
  });

  // Goal Ellipse
  elements.push({
    id: crypto.randomUUID(),
    roomId,
    authorId,
    tool: 'ellipse',
    type: 'ellipse',
    x: goalX,
    y: goalY,
    w: 120,
    h: 80,
    points: [[goalX, goalY], [goalX + 120, goalY + 80]],
    fillColor: '#bbf7d0',
    color: '#000000',
    strokeColor: '#000000',
    width: 2.5,
    strokeWidth: 2.5,
    createdAt: now,
    active: true
  });

  // Goal Text
  elements.push({
    id: crypto.randomUUID(),
    roomId,
    authorId,
    tool: 'text',
    type: 'text',
    x: goalX + 22,
    y: goalY + 46,
    text: '🏁 SUCCESS\n& LAUNCH',
    fontSize: 13,
    color: '#000000',
    strokeColor: '#000000',
    createdAt: now,
    active: true
  });

  return elements;
}

