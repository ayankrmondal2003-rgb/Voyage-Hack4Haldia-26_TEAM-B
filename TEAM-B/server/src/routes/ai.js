import { Router } from 'express';

export function aiRoutes() {
  const router = Router();

  router.post('/generate', async (req, res) => {
    const { topic = '', mode = 'execution' } = req.body || {};
    const cleanTitle = (topic ? String(topic).trim() : 'Project Idea').replace(/^\w/, c => c.toUpperCase());

    // 1. EXECUTION BLUEPRINT
    if (mode === 'execution') {
      return res.json({
        ok: true,
        plan: {
          title: cleanTitle,
          mode: 'execution',
          stages: [
            { badge: '01', name: 'Core Concept & USP', color: '#fef08a', tasks: [`Core Problem: Friction in ${cleanTitle}`, 'Unique Value: 10x faster & intuitive workflow', 'Differentiator: Real-time multiplayer + AI assistance', 'Hero Feature: Zero-setup browser access'] },
            { badge: '02', name: 'Market & Validation', color: '#bbf7d0', tasks: ['Target Persona: Builders, engineers & remote teams', 'Validation Test: 48h landing page smoke test', 'Early Adopters: Hackathon teams & tech communities', 'Success Metric: 25% weekly active retention'] },
            { badge: '03', name: 'Tech Architecture', color: '#e0f2fe', tasks: ['Frontend: React 19 + High-DPI Canvas 2D engine', 'Backend: Node.js Express + WebSocket (Socket.IO)', 'Persistence: MongoDB Atlas transactional replica set', 'AI Integration: Structured semantic synthesis pipeline'] },
            { badge: '04', name: 'Sprint Execution Plan', color: '#fca5a5', tasks: ['Sprint 1: Scaffold auth-free rooms & base canvas', 'Sprint 2: Real-time stroke streaming & outbox retry', 'Sprint 3: AI roadmap & idea execution engine', 'Sprint 4: End-to-end tests, PNG export & polish'] },
            { badge: '05', name: 'Launch & Pitch Strategy', color: '#f3e8ff', tasks: ['Public Hosting: Render web service cloud hosting', 'Growth Rail: ProductHunt, GitHub & Twitter launch', 'Monetization: Free tier + Team workspace plan', 'Judge Pitch: 2-minute live multiplayer demonstration'] }
          ]
        }
      });
    }

    // 2. IDEATION STUDIO
    if (mode === 'ideation') {
      return res.json({
        ok: true,
        plan: {
          title: cleanTitle,
          mode: 'ideation',
          center: { title: `💡 Innovation Hub: ${cleanTitle}`, subtitle: 'Brainstormed Breakthrough Concepts', color: '#fef08a' },
          ideas: [
            { title: `${cleanTitle} AI Co-Pilot`, color: '#bbf7d0', tasks: ['Problem: Slow manual workflows', 'Killer Feature: Autonomous reasoning & step suggestions', 'Audience: Fast-moving teams'] },
            { title: `Decentralized ${cleanTitle} Network`, color: '#e0f2fe', tasks: ['Problem: High platform fees & vendor lock-in', 'Killer Feature: Direct P2P protocol & instant settlement', 'Audience: Independent creators'] },
            { title: `Real-time ${cleanTitle} Canvas`, color: '#fca5a5', tasks: ['Problem: Context switching across multiple fragmented apps', 'Killer Feature: Unified whiteboard with live collaboration', 'Audience: Distributed engineering teams'] },
            { title: `Automated ${cleanTitle} Auditor`, color: '#f3e8ff', tasks: ['Problem: Compliance errors & missed edge cases', 'Killer Feature: Instant scanning with auto-remediation PRs', 'Audience: Enterprise organizations'] }
          ]
        }
      });
    }

    // 3. MINDMAP
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

    // 4. ROADMAP
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
