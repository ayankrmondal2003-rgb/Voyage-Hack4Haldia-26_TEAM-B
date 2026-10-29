import { Router } from 'express';

const KNOWLEDGE_BASE = {
  'fullstack': {
    title: 'Full-Stack Web Architecture',
    phases: [
      { title: 'Phase 1: Architecture & Data', color: '#bbf7d0', tasks: ['Schema modeling in MongoDB', 'REST & WebSocket API design', 'Security & CORS configuration'] },
      { title: 'Phase 2: Frontend Foundation', color: '#e0f2fe', tasks: ['React 19 + Vite canvas workspace', 'High-DPI 2D coordinate rendering', 'State synchronization engine'] },
      { title: 'Phase 3: Real-Time Sync', color: '#fef08a', tasks: ['Socket.IO room isolation', 'Sub-30ms stroke streaming', 'Outbox retry & reconciliation'] },
      { title: 'Phase 4: Testing & Hardening', color: '#fca5a5', tasks: ['Automated acceptance tests', 'Per-user undo/redo ownership', 'DPI scaling & math validation'] },
      { title: 'Phase 5: Cloud Deployment', color: '#f3e8ff', tasks: ['Render web service hosting', 'Atlas replica set connection', 'Live multi-user demo'] }
    ]
  },
  'ai-agent': {
    title: 'Autonomous AI Agent Architecture',
    phases: [
      { title: 'Phase 1: Agent Scope & Tooling', color: '#bbf7d0', tasks: ['Define agent objective & constraints', 'Model context window budgeting', 'MCP tool protocol integration'] },
      { title: 'Phase 2: Execution Sandbox', color: '#e0f2fe', tasks: ['Safe sandbox environment setup', 'State persistence & audit logs', 'Real-time telemetry streaming'] },
      { title: 'Phase 3: Reasoning Engine', color: '#fef08a', tasks: ['Chain-of-thought prompt strategy', 'Vector embeddings & RAG pipeline', 'Hallucination verification checks'] },
      { title: 'Phase 4: Multi-Agent Swarm', color: '#fca5a5', tasks: ['Delegation & consensus protocol', 'Parallel task decomposition', 'Error escalation & fallback'] },
      { title: 'Phase 5: Production Launch', color: '#f3e8ff', tasks: ['Latency & token cost optimization', 'Benchmark evaluation tests', 'Live operational dashboard'] }
    ]
  }
};

export function aiRoutes() {
  const router = Router();

  router.post('/generate', async (req, res) => {
    const { topic = '', mode = 'roadmap' } = req.body || {};
    const query = String(topic).trim().toLowerCase();

    // Check pre-configured templates
    for (const [key, preset] of Object.entries(KNOWLEDGE_BASE)) {
      if (query.includes(key)) {
        return res.json({ ok: true, plan: { ...preset, mode } });
      }
    }

    const cleanTitle = (topic ? String(topic).trim() : 'Project Roadmap').replace(/^\w/, c => c.toUpperCase());

    if (mode === 'mindmap') {
      return res.json({
        ok: true,
        plan: {
          title: cleanTitle,
          mode: 'mindmap',
          center: { title: `💡 ${cleanTitle}`, subtitle: 'Core Concept & Strategy', color: '#fef08a' },
          satellites: [
            { title: '👥 Target Audience', color: '#bbf7d0', tasks: ['Primary end-users & personas', 'Core user pain points', 'Adoption barriers & solutions'] },
            { title: '⚡ Core Value & Features', color: '#e0f2fe', tasks: ['Unique selling proposition', 'Key killer feature workflows', 'Real-time collaborative aspect'] },
            { title: '🛠️ Architecture & Tech', color: '#fca5a5', tasks: ['Modern modular stack choice', 'Data persistence & sync engine', 'API security & scalability'] },
            { title: '📈 Impact & Next Steps', color: '#f3e8ff', tasks: ['Key milestone measurements', 'User feedback & iterations', 'Horizontal scaling expansion'] }
          ]
        }
      });
    }

    // Default 5-phase roadmap
    res.json({
      ok: true,
      plan: {
        title: cleanTitle,
        mode: 'roadmap',
        phases: [
          { title: 'Phase 1: Research & Scope', color: '#bbf7d0', tasks: [`Define requirements for ${cleanTitle}`, 'Competitor & workflow analysis', 'Technical feasibility study'] },
          { title: 'Phase 2: Foundation & Prototype', color: '#e0f2fe', tasks: ['Design core system architecture', 'Build minimal working prototype', 'Establish base state & storage'] },
          { title: 'Phase 3: Core Implementation', color: '#fef08a', tasks: ['Build interactive features', 'Integrate real-time data pipelines', 'Refine user interface & polish'] },
          { title: 'Phase 4: Validation & Testing', color: '#fca5a5', tasks: ['Edge case & load testing', 'User feedback & usability tweaks', 'Reliability & reconnect checks'] },
          { title: 'Phase 5: Launch & Presentation', color: '#f3e8ff', tasks: ['Live cloud deployment', 'Demonstrate to stakeholders', 'Plan future enhancement roadmap'] }
        ]
      }
    });
  });

  return router;
}
