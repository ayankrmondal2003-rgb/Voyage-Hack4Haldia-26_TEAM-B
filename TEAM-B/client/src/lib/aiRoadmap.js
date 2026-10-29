// Comprehensive AI Innovation, Idea Generation & Execution Blueprint Engine for TEAM-B Whiteboard

const DOMAIN_IDEAS = {
  'health': [
    { title: 'AI Triage & Symptom Navigator', problem: 'ER overcrowding & slow doctor matching', sauce: 'Live LLM triage with medical guideline safety checks', audience: 'Clinics & tele-health patients' },
    { title: 'Smart Prescription Adherence Tracker', problem: 'Patients missing critical doses', sauce: 'Computer vision pill verification & automated alerts', audience: 'Elderly care & chronic patients' },
    { title: 'Personalized Nutrition Bio-Coach', problem: 'Generic diets failing long term', sauce: 'Glucose monitor integration + meal photo breakdown', audience: 'Athletes & wellness enthusiasts' },
    { title: 'Mental Health Voice Journal', problem: 'Therapy cost & daily journaling friction', sauce: 'Speech emotion analysis + reflective voice prompts', audience: 'Stressed students & young professionals' }
  ],
  'fintech': [
    { title: 'Autonomous Invoice Factoring', problem: 'Freelancers waiting 60+ days for payment', sauce: 'Instant escrow discounting via creditworthiness scoring', audience: 'Freelancers & small business owners' },
    { title: 'AI Micro-Investment Roundups', problem: 'Gen-Z struggling to save spare change', sauce: 'Algorithmic micro-saving into diversified bond baskets', audience: 'College students & first-time earners' },
    { title: 'Cross-Border Real-Time Settlement', problem: 'High bank fees & 3-day wire delays', sauce: 'Multi-rail crypto-to-fiat routing with instant conversion', audience: 'Remote global contractors' },
    { title: 'Automated Tax Deduction Hunter', problem: 'Missed deductible expenses costing thousands', sauce: 'Bank transaction OCR + receipt email parsing', audience: 'Gig economy workers & sole proprietors' }
  ],
  'education': [
    { title: 'Interactive Socratic Tutor', problem: 'Passive video lectures lead to low retention', sauce: 'AI agent that questions the student instead of lecturing', audience: 'K-12 & university students' },
    { title: 'Peer Study Squad Matcher', problem: 'Remote online courses feel isolated & lonely', sauce: 'Timezone + study habit clustering with shared rooms', audience: 'Online bootcamp & college students' },
    { title: 'Visual Code Execution Animator', problem: 'Beginners struggling with pointers & memory', sauce: 'Dynamic step-through diagrams generated on a whiteboard', audience: 'CS students & self-taught devs' },
    { title: 'Adaptive Flashcard Recall Engine', problem: 'Manual flashcard creation takes hours', sauce: 'PDF textbook to active recall decks with spaced repetition', audience: 'Medical & law students' }
  ],
  'ai': [
    { title: 'Autonomous Code Refactoring Agent', problem: 'Legacy technical debt slowing down engineering', sauce: 'Static AST analysis + test-driven pull request generation', audience: 'Enterprise dev teams' },
    { title: 'Multiplayer Visual AI Whiteboard', problem: 'Remote teams cannot visually ideate with AI', sauce: 'Real-time canvas with AI roadmap & execution synthesis', audience: 'Hackathon teams & software architects' },
    { title: 'Hallucination Verification Proxy', problem: 'Enterprise afraid of LLM falsehoods in production', sauce: 'Dual-agent consensus & citation cross-checking layer', audience: 'B2B AI applications' },
    { title: 'Voice-First AI Customer Support Swarm', problem: 'Frustrating robotic phone menus', sauce: 'Sub-300ms ultra-low latency conversational voice agents', audience: 'E-commerce & SaaS customer service' }
  ],
  'productivity': [
    { title: 'Meeting-to-Action Plan Canvas', problem: 'Action items get buried in meeting recordings', sauce: 'Live audio transcription mapped directly to Kanban whiteboard', audience: 'Project managers & remote teams' },
    { title: 'Distraction-Free Deep Work Blocker', problem: 'Context switching wasting 2 hours/day', sauce: 'Calendar-synchronized micro-sessions + website shielding', audience: 'Knowledge workers & writers' },
    { title: 'Team Knowledge Base Auto-Updater', problem: 'Notion/Confluence docs become obsolete instantly', sauce: 'Slack/GitHub activity monitor that suggests doc edits', audience: 'Fast-moving tech startups' },
    { title: 'Async Video Standup Summarizer', problem: 'Daily standup meetings draining engineering focus', sauce: '1-minute Loom videos auto-transcribed into daily updates', audience: 'Async-first engineering teams' }
  ]
};

/**
 * Synthesizes ideas, execution blueprints, roadmaps, or mindmaps.
 */
export function synthesizePlan({ topic, mode = 'execution' }) {
  const query = (topic || '').trim().toLowerCase();
  const cleanTitle = (topic ? String(topic).trim() : 'Next-Gen Project').replace(/^\w/, c => c.toUpperCase());

  // ------------------------------------------------------------------
  // MODE 1: EXECUTION BLUEPRINT ("How to execute that idea")
  // ------------------------------------------------------------------
  if (mode === 'execution') {
    return {
      title: cleanTitle,
      mode: 'execution',
      stages: [
        {
          badge: '01',
          name: 'Core Concept & USP',
          color: '#fef08a', // Yellow
          tasks: [
            `Core Problem: Solves critical friction in ${cleanTitle}`,
            `Unique Value: 10x faster & intuitive workflow`,
            `Differentiator: Real-time multiplayer + AI assistance`,
            `Hero Feature: Zero-setup browser access`
          ]
        },
        {
          badge: '02',
          name: 'Market & Validation',
          color: '#bbf7d0', // Mint
          tasks: [
            `Target Persona: Builders, engineers & remote teams`,
            `Validation Test: 48h landing page smoke test`,
            `Early Adopters: Hackathon teams & tech communities`,
            `Success Metric: 25% weekly active retention`
          ]
        },
        {
          badge: '03',
          name: 'Tech Architecture',
          color: '#e0f2fe', // Sky Blue
          tasks: [
            `Frontend: React 19 + High-DPI Canvas 2D engine`,
            `Backend: Node.js Express + WebSocket (Socket.IO)`,
            `Persistence: MongoDB Atlas transactional replica set`,
            `AI Integration: Structured semantic synthesis pipeline`
          ]
        },
        {
          badge: '04',
          name: 'Sprint Execution Plan',
          color: '#fca5a5', // Coral
          tasks: [
            `Sprint 1: Scaffold auth-free rooms & base canvas`,
            `Sprint 2: Real-time stroke streaming & outbox retry`,
            `Sprint 3: AI roadmap & idea execution engine`,
            `Sprint 4: End-to-end tests, PNG export & polish`
          ]
        },
        {
          badge: '05',
          name: 'Launch & Pitch Strategy',
          color: '#f3e8ff', // Lavender
          tasks: [
            `Public Hosting: Render web service cloud hosting`,
            `Growth Rail: ProductHunt, GitHub & Twitter launch`,
            `Monetization: Free tier + Team workspace plan`,
            `Judge Pitch: 2-minute live multiplayer demonstration`
          ]
        }
      ]
    };
  }

  // ------------------------------------------------------------------
  // MODE 2: IDEATION STUDIO ("Brainstorm & generate new ideas")
  // ------------------------------------------------------------------
  if (mode === 'ideation') {
    let matchedIdeas = DOMAIN_IDEAS['ai'];
    if (/health|med|clinic|doctor|patient|bio/i.test(query)) matchedIdeas = DOMAIN_IDEAS['health'];
    else if (/fin|bank|money|invest|pay|tax|crypto|cash/i.test(query)) matchedIdeas = DOMAIN_IDEAS['fintech'];
    else if (/edu|learn|study|student|school|teach|course/i.test(query)) matchedIdeas = DOMAIN_IDEAS['education'];
    else if (/prod|work|task|manage|team|meet|remote|tool/i.test(query)) matchedIdeas = DOMAIN_IDEAS['productivity'];

    // Or synthesize from query keywords
    const ideas = matchedIdeas.map(item => ({
      title: item.title,
      color: '#e0f2fe',
      tasks: [
        `Problem: ${item.problem}`,
        `Killer Feature: ${item.sauce}`,
        `Audience: ${item.audience}`
      ]
    }));

    return {
      title: cleanTitle,
      mode: 'ideation',
      center: {
        title: `💡 Innovation Hub: ${cleanTitle}`,
        subtitle: 'Brainstormed Breakthrough Concepts',
        color: '#fef08a'
      },
      ideas
    };
  }

  // ------------------------------------------------------------------
  // MODE 3: MINDMAP ("Concept Hub & Radiating Satellites")
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // MODE 4: MILESTONE ROADMAP ("Phased Flowchart Timeline")
  // ------------------------------------------------------------------
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

/**
 * Converts plan into native whiteboard canvas elements conforming to shared/protocol.js.
 */
export function generateCanvasElements(plan, { centerX = 400, centerY = 300, roomId, authorId }) {
  const elements = [];
  const now = new Date().toISOString();

  // ==================================================================
  // 1. EXECUTION BLUEPRINT LAYOUT (How to Execute the Idea)
  // ==================================================================
  if (plan.mode === 'execution') {
    const cardW = 270;
    const cardH = 175;
    const gap = 65;
    const count = plan.stages.length;
    const totalW = count * cardW + (count - 1) * gap;
    const startX = centerX - totalW / 2;
    const startY = centerY - cardH / 2;

    // Header Title Banner
    elements.push({
      id: crypto.randomUUID(),
      roomId,
      authorId,
      tool: 'text',
      type: 'text',
      x: startX,
      y: startY - 55,
      text: `⚡ EXECUTION BLUEPRINT: ${plan.title.toUpperCase()}`,
      fontSize: 22,
      color: '#000000',
      strokeColor: '#000000',
      createdAt: now,
      active: true
    });

    elements.push({
      id: crypto.randomUUID(),
      roomId,
      authorId,
      tool: 'text',
      type: 'text',
      x: startX,
      y: startY - 25,
      text: 'Step-by-step actionable plan from Idea ➔ Validation ➔ Tech Build ➔ Execution ➔ Launch',
      fontSize: 13,
      color: '#4b5563',
      strokeColor: '#4b5563',
      createdAt: now,
      active: true
    });

    const cards = [];

    plan.stages.forEach((stage, i) => {
      const cardX = startX + i * (cardW + gap);
      const cardY = startY;
      cards.push({ cardX, cardY, cardW, cardH });

      // Card Background
      elements.push({
        id: crypto.randomUUID(),
        roomId,
        authorId,
        tool: 'rectangle',
        type: 'rectangle',
        x: cardX,
        y: cardY,
        w: cardW,
        h: cardH,
        points: [[cardX, cardY], [cardX + cardW, cardY + cardH]],
        fillColor: stage.color,
        color: '#000000',
        strokeColor: '#000000',
        width: 2.5,
        strokeWidth: 2.5,
        createdAt: now,
        active: true
      });

      // Stage Step Badge & Title
      elements.push({
        id: crypto.randomUUID(),
        roomId,
        authorId,
        tool: 'text',
        type: 'text',
        x: cardX + 14,
        y: cardY + 26,
        text: `${stage.badge}. ${stage.name.toUpperCase()}`,
        fontSize: 14,
        color: '#000000',
        strokeColor: '#000000',
        createdAt: now,
        active: true
      });

      // Tasks List
      elements.push({
        id: crypto.randomUUID(),
        roomId,
        authorId,
        tool: 'text',
        type: 'text',
        x: cardX + 14,
        y: cardY + 54,
        text: stage.tasks.map(t => `• ${t}`).join('\n'),
        fontSize: 11.5,
        color: '#1f2937',
        strokeColor: '#1f2937',
        createdAt: now,
        active: true
      });
    });

    // Connecting Arrows between consecutive execution stages
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

    // Final Success Goal Badge (Ellipse)
    const lastCard = cards[cards.length - 1];
    const goalX = lastCard.cardX + lastCard.cardW + 65;
    const goalY = lastCard.cardY + lastCard.cardH / 2 - 45;

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

    elements.push({
      id: crypto.randomUUID(),
      roomId,
      authorId,
      tool: 'ellipse',
      type: 'ellipse',
      x: goalX,
      y: goalY,
      w: 120,
      h: 90,
      points: [[goalX, goalY], [goalX + 120, goalY + 90]],
      fillColor: '#bbf7d0',
      color: '#000000',
      strokeColor: '#000000',
      width: 2.5,
      strokeWidth: 2.5,
      createdAt: now,
      active: true
    });

    elements.push({
      id: crypto.randomUUID(),
      roomId,
      authorId,
      tool: 'text',
      type: 'text',
      x: goalX + 22,
      y: goalY + 45,
      text: '🚀 SHIP & \n SCALE!',
      fontSize: 13,
      color: '#000000',
      strokeColor: '#000000',
      createdAt: now,
      active: true
    });

    return elements;
  }

  // ==================================================================
  // 2. IDEATION STUDIO (Brainstorm 4 breakthrough ideas from domain)
  // ==================================================================
  if (plan.mode === 'ideation') {
    const hubW = 300;
    const hubH = 95;
    const hubX = centerX - hubW / 2;
    const hubY = centerY - hubH / 2;

    // Hub Card
    elements.push({
      id: crypto.randomUUID(),
      roomId,
      authorId,
      tool: 'rectangle',
      type: 'rectangle',
      x: hubX,
      y: hubY,
      w: hubW,
      h: hubH,
      points: [[hubX, hubY], [hubX + hubW, hubY + hubH]],
      fillColor: '#fef08a',
      color: '#000000',
      strokeColor: '#000000',
      width: 3,
      strokeWidth: 3,
      createdAt: now,
      active: true
    });

    elements.push({
      id: crypto.randomUUID(),
      roomId,
      authorId,
      tool: 'text',
      type: 'text',
      x: hubX + 14,
      y: hubY + 34,
      text: plan.center.title,
      fontSize: 16,
      color: '#000000',
      strokeColor: '#000000',
      createdAt: now,
      active: true
    });

    elements.push({
      id: crypto.randomUUID(),
      roomId,
      authorId,
      tool: 'text',
      type: 'text',
      x: hubX + 14,
      y: hubY + 65,
      text: plan.center.subtitle,
      fontSize: 12,
      color: '#4b5563',
      strokeColor: '#4b5563',
      createdAt: now,
      active: true
    });

    // 4 Ideas around hub
    const cardW = 270;
    const cardH = 150;
    const offsetX = 370;
    const offsetY = 190;

    const positions = [
      { x: centerX - offsetX - cardW / 2, y: centerY - offsetY - cardH / 2, color: '#bbf7d0' },
      { x: centerX + offsetX - cardW / 2, y: centerY - offsetY - cardH / 2, color: '#e0f2fe' },
      { x: centerX - offsetX - cardW / 2, y: centerY + offsetY - cardH / 2, color: '#fca5a5' },
      { x: centerX + offsetX - cardW / 2, y: centerY + offsetY - cardH / 2, color: '#f3e8ff' }
    ];

    plan.ideas.forEach((idea, i) => {
      const pos = positions[i] || positions[0];

      // Idea Card
      elements.push({
        id: crypto.randomUUID(),
        roomId,
        authorId,
        tool: 'rectangle',
        type: 'rectangle',
        x: pos.x,
        y: pos.y,
        w: cardW,
        h: cardH,
        points: [[pos.x, pos.y], [pos.x + cardW, pos.y + cardH]],
        fillColor: pos.color,
        color: '#000000',
        strokeColor: '#000000',
        width: 2.5,
        strokeWidth: 2.5,
        createdAt: now,
        active: true
      });

      // Idea Title
      elements.push({
        id: crypto.randomUUID(),
        roomId,
        authorId,
        tool: 'text',
        type: 'text',
        x: pos.x + 14,
        y: pos.y + 26,
        text: `💡 Idea ${i + 1}: ${idea.title}`,
        fontSize: 14,
        color: '#000000',
        strokeColor: '#000000',
        createdAt: now,
        active: true
      });

      // Tasks / Details
      elements.push({
        id: crypto.randomUUID(),
        roomId,
        authorId,
        tool: 'text',
        type: 'text',
        x: pos.x + 14,
        y: pos.y + 54,
        text: idea.tasks.map(t => `• ${t}`).join('\n'),
        fontSize: 11.5,
        color: '#1f2937',
        strokeColor: '#1f2937',
        createdAt: now,
        active: true
      });

      // Radiating Arrow from Hub to Idea Card
      const hubEdgeX = pos.x < hubX ? hubX : hubX + hubW;
      const hubEdgeY = pos.y < hubY ? hubY + 20 : hubY + hubH - 20;
      const satEdgeX = pos.x < hubX ? pos.x + cardW : pos.x;
      const satEdgeY = pos.y + cardH / 2;

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

  // ==================================================================
  // 3. MINDMAP & ROADMAP LAYOUTS
  // ==================================================================
  if (plan.mode === 'mindmap') {
    const hubW = 280;
    const hubH = 100;
    const hubX = centerX - hubW / 2;
    const hubY = centerY - hubH / 2;

    elements.push({
      id: crypto.randomUUID(),
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

      elements.push({
        id: crypto.randomUUID(),
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

  // Fallback: 5-Phase Roadmap Flowchart
  const cardW = 260;
  const cardH = 150;
  const gap = 80;
  const totalW = plan.phases.length * cardW + (plan.phases.length - 1) * gap;
  const startX = centerX - totalW / 2;
  const startY = centerY - cardH / 2;

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

    elements.push({
      id: crypto.randomUUID(),
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

  return elements;
}
