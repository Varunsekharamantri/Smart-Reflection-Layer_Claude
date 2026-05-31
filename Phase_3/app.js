/**
 * SMART REFLECTION LAYER - PHASE 3 CONNECTOR ENGINE
 * Implements absolute canvas overlay coordinate trackers,
 * sweeping cubic Bezier path math, real-time animation interval redrawing,
 * and high-fidelity synchronized marching-ants hover traces.
 */

// ==========================================
// Standalone Strategic Payload Mock (Instant Fallback Engine)
// ==========================================
const MOCK_STRATEGIC_PAYLOAD = {
  response_text: "Yes—prioritizing PLG growth is the right strategic bet for your B2B SaaS product at this stage. It aligns with your product's strengths, accelerates learning loops, and creates a scalable engine for long-term value.\n\nYour product has strong self-serve adoption potential, and your ICPs are already showing intent-driven behavior. PLG will help you expand top-of-funnel volume, shorten time to value, and convert users through product experience instead of sales intervention.\n\nOnce product-led momentum is established, you can layer in sales for expansion and enterprise motions. But establishing a PLG core now gives you optionality, compounding data advantages, and a defensible moat.",
  reflection_mode: {
    status: "active",
    highlights: [
      { id: "hl-1", text_span: "shorten time to value", category: "assumption" },
      { id: "hl-2", text_span: "defensible moat", category: "alternative" }
    ],
    modules: {
      assumptions: [
        { summary: "Assumes churn is feature-driven", details: "Presumes user attrition is triggered by product utility issues rather than pricing tiers or commercial terms." },
        { summary: "Assumes onboarding can scale efficiently", details: "Assumes self-serve tutorials and guided setups can successfully guide new signups without direct customer success team support." }
      ],
      missing_context: [
        { summary: "No competitor pricing data", details: "Omission of competitor price points makes assessing the product's value proposition against alternative SaaS models speculative." },
        { summary: "Limited retention cohort evidence", details: "Lack of long-term weekly/monthly retention rate data for current active customers limits predictions of downstream LTV." }
      ],
      uncertainty_boundary: [
        { summary: "Confidence decreases in enterprise-heavy markets", details: "The proposed PLG playbook loses significant confidence if target buyers are primarily enterprise companies requiring complex security audits, procurement reviews, and high-touch sales negotiations." }
      ],
      alternative_perspectives: [
        { summary: "Sales-led growth may outperform PLG for high-ACV customers", details: "In enterprise segments with high Annual Contract Value (ACV), a dedicated, outbound enterprise sales motion frequently triggers faster revenue velocity and higher account retention." }
      ],
      reflection_prompt: {
        question: "What evidence would invalidate this recommendation?"
      }
    }
  }
};

// ==========================================
// Highlight Parser
// ==========================================
function parseTextHighlights(text, highlights) {
  if (!highlights || highlights.length === 0) {
    return text.split('\n\n').map(p => `<p class="response-para">${escapeHTML(p)}</p>`).join('');
  }

  let parsedHTML = text;
  const sortedHighlights = [...highlights].sort((a, b) => b.text_span.length - a.text_span.length);
  
  sortedHighlights.forEach(hl => {
    const textSpan = hl.text_span;
    const category = hl.category;
    const id = hl.id;
    
    const replacement = `<span class="reflection-highlight category-${category}" data-hl-id="${id}">${escapeHTML(textSpan)}</span>`;
    parsedHTML = parsedHTML.replaceAll(textSpan, replacement);
  });

  return parsedHTML.split('\n\n').map(p => {
    if (p.includes('<span class="reflection-highlight')) {
      return `<p class="response-para">${p}</p>`;
    }
    return `<p class="response-para">${escapeHTML(p)}</p>`;
  }).join('');
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// 📐 Bezier Visual Connector Math Engine
// ==========================================
let currentHighlightsData = []; // Cached metadata to redraw on changes

function drawConnectorLines() {
  const canvas = document.getElementById('connector-canvas');
  if (!canvas) return;

  // Clear existing lines
  canvas.innerHTML = '';

  const parent = document.getElementById('assistant-bubble-container');
  if (!parent) return;

  const parentRect = parent.getBoundingClientRect();
  const drawer = document.getElementById('reflection-drawer');
  const isDrawerCollapsed = drawer.classList.contains('collapsed');

  // Check if there are active highlight items currently rendered
  const highlights = document.querySelectorAll('.reflection-highlight');
  if (highlights.length === 0) return;

  highlights.forEach(span => {
    const hlId = span.getAttribute('data-hl-id');
    const matchedData = currentHighlightsData.find(item => item.id === hlId);
    if (!matchedData) return;

    const spanRect = span.getBoundingClientRect();
    
    // Calculate start coordinate: center-right edge of the highlighted text span
    const x1 = spanRect.right - parentRect.left;
    const y1 = spanRect.top - parentRect.top + spanRect.height / 2;

    let x2, y2;
    
    if (isDrawerCollapsed) {
      // closed state: connect all highlight paths to the "Reflection Mode Active" trigger header right edge
      const anchor = document.getElementById('header-connector-anchor');
      if (!anchor) return;
      const anchorRect = anchor.getBoundingClientRect();
      
      x2 = anchorRect.left - parentRect.left - 4;
      y2 = anchorRect.top - parentRect.top + anchorRect.height / 2;
    } else {
      // open state: connect highlights directly to their matching expanded card headers
      const card = document.querySelector(`.reflection-card-accordion[data-hl-target="${hlId}"]`);
      if (!card) return;
      
      const cardTrigger = card.querySelector('.card-trigger');
      const cardRect = cardTrigger.getBoundingClientRect();
      
      // Target points: right end of card button headers (slightly indented)
      x2 = cardRect.right - parentRect.left - 24;
      y2 = cardRect.top - parentRect.top + cardRect.height / 2;
    }

    // Organic Cubic Bezier Formula
    // Computes control points sweeping towards the right edge of the chat viewport
    const rightMarginX = parentRect.width - 6; // Guide curve coordinates
    
    // Closed state gets direct smooth S-curves, open state sweeps to the margin
    let pathD;
    if (isDrawerCollapsed) {
      const ctrlX = x1 + (x2 - x1) * 0.4;
      pathD = `M ${x1} ${y1} C ${ctrlX} ${y1}, ${x2 - (x2 - x1) * 0.4} ${y2}, ${x2} ${y2}`;
    } else {
      // Mockup sweeping grouping curves: control points pull elements to the right margin
      pathD = `M ${x1} ${y1} C ${rightMarginX} ${y1}, ${rightMarginX} ${y2}, ${x2} ${y2}`;
    }

    // Create and append SVG path node
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('class', `connector-path color-${matchedData.category}`);
    path.setAttribute('data-link-id', hlId);
    canvas.appendChild(path);
  });
}

// Real-Time Animation Frame Redraw
// Triggers rapid path updates during CSS height shifts (grid-row expansions)
function triggerTransitionAnimationRedraw() {
  const duration = 400; // Matches CSS accordion expand times
  const interval = 16;   // ~60 FPS
  let elapsed = 0;
  
  const redrawTimer = setInterval(() => {
    drawConnectorLines();
    elapsed += interval;
    if (elapsed >= duration) {
      clearInterval(redrawTimer);
      drawConnectorLines(); // Final perfect snap
    }
  }, interval);
}

// ==========================================
// UI Render & Dynamic Assembly
// ==========================================
function renderResponsePayload(payload) {
  const contentArea = document.getElementById('response-content-area');
  const drawer = document.getElementById('reflection-drawer');
  
  currentHighlightsData = payload.reflection_mode.highlights;

  // 1. Render Core Response Text & Inject Dynamic Spans
  const formattedHTML = parseTextHighlights(payload.response_text, currentHighlightsData);
  contentArea.innerHTML = formattedHTML;

  // 2. Configure Reflection Drawer
  if (payload.reflection_mode.status === 'active') {
    drawer.classList.remove('collapsed');
    drawer.style.display = "flex";
    
    const modules = payload.reflection_mode.modules;
    
    // Populate cards
    document.getElementById('content-assumptions').innerHTML = `
      <ul class="card-list">
        ${modules.assumptions.map(item => `
          <li class="card-list-item"><strong>${escapeHTML(item.summary)}</strong>: ${escapeHTML(item.details)}</li>
        `).join('')}
      </ul>
    `;

    document.getElementById('content-context').innerHTML = `
      <ul class="card-list">
        ${modules.missing_context.map(item => `
          <li class="card-list-item"><strong>${escapeHTML(item.summary)}</strong>: ${escapeHTML(item.details)}</li>
        `).join('')}
      </ul>
    `;

    document.getElementById('content-uncertainty').innerHTML = `
      <div class="card-text-block">
        ${modules.uncertainty_boundary.map(item => `
          <p><strong>${escapeHTML(item.summary)}</strong>: ${escapeHTML(item.details)}</p>
        `).join('')}
      </div>
    `;

    document.getElementById('content-alternatives').innerHTML = `
      <div class="card-text-block">
        ${modules.alternative_perspectives.map(item => `
          <p><strong>${escapeHTML(item.summary)}</strong>: ${escapeHTML(item.details)}</p>
        `).join('')}
      </div>
    `;

    document.getElementById('content-prompt').innerHTML = `
      <p class="card-prompt-question">"${escapeHTML(modules.reflection_prompt.question)}"</p>
    `;
    
    // Bind all dynamic interactive hovers & coordinates
    setTimeout(() => {
      drawConnectorLines();
      setupInteractiveHoverSync();
    }, 50);
    
  } else {
    drawer.classList.add('collapsed');
    drawer.style.display = "none";
    drawConnectorLines();
  }
}

// ==========================================
// Interactive Accordion Controller
// ==========================================
function setupAccordionToggles() {
  const mainTrigger = document.getElementById('reflection-trigger-btn');
  const mainDrawer = document.getElementById('reflection-drawer');
  
  mainTrigger.addEventListener('click', () => {
    const isCollapsed = mainDrawer.classList.toggle('collapsed');
    mainTrigger.setAttribute('aria-expanded', !isCollapsed);
    
    // Real-time trace morphing
    triggerTransitionAnimationRedraw();
  });

  const cards = document.querySelectorAll('.reflection-card-accordion');
  cards.forEach(card => {
    const trigger = card.querySelector('.card-trigger');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasCollapsed = card.classList.contains('collapsed');
      
      cards.forEach(c => c.classList.add('collapsed'));
      
      if (wasCollapsed) {
        card.classList.remove('collapsed');
      }
      
      // Morph curved lines to align with the new expanded card height
      triggerTransitionAnimationRedraw();
    });
  });
}

// ==========================================
// Synced Hover State Framework
// ==========================================
function setupInteractiveHoverSync() {
  const highlights = document.querySelectorAll('.reflection-highlight');
  const cards = document.querySelectorAll('.reflection-card-accordion');

  // Trigger Action: Hover Highlight Spans -> Highlight line & Card
  highlights.forEach(span => {
    const hlId = span.getAttribute('data-hl-id');
    const targetCard = document.querySelector(`.reflection-card-accordion[data-hl-target="${hlId}"]`);
    const targetPath = document.querySelector(`.connector-path[data-link-id="${hlId}"]`);

    if (targetCard) {
      span.addEventListener('mouseenter', () => {
        span.classList.add('active');
        targetCard.classList.add('active-glow');
        if (targetPath) targetPath.classList.add('active');
        
        // Expand matching accordion if drawer is open
        const drawer = document.getElementById('reflection-drawer');
        if (!drawer.classList.contains('collapsed')) {
          cards.forEach(c => c.classList.add('collapsed'));
          targetCard.classList.remove('collapsed');
          // Redraw to adjust to active height shift
          triggerTransitionAnimationRedraw();
        }
      });

      span.addEventListener('mouseleave', () => {
        span.classList.remove('active');
        targetCard.classList.remove('active-glow');
        if (targetPath) targetPath.classList.remove('active');
      });
    }
  });

  // Trigger Action: Hover Cards -> Glow corresponding line & span
  cards.forEach(card => {
    const targetId = card.getAttribute('data-hl-target');
    if (targetId) {
      const targetSpan = document.querySelector(`.reflection-highlight[data-hl-id="${targetId}"]`);
      const targetPath = document.querySelector(`.connector-path[data-link-id="${targetId}"]`);
      
      if (targetSpan) {
        card.addEventListener('mouseenter', () => {
          targetSpan.classList.add('active');
          card.classList.add('active-glow');
          if (targetPath) targetPath.classList.add('active');
        });

        card.addEventListener('mouseleave', () => {
          targetSpan.classList.remove('active');
          card.classList.remove('active-glow');
          if (targetPath) targetPath.classList.remove('active');
        });
      }
    }
  });
}

// ==========================================
// Window Resize Observers
// ==========================================
function setupResizeObservers() {
  // Triggers recalculations when window resizes or dev wrappers shrink
  window.addEventListener('resize', drawConnectorLines);

  const container = document.getElementById('assistant-bubble-container');
  if (container) {
    const observer = new ResizeObserver(() => {
      drawConnectorLines();
    });
    observer.observe(container);
  }
}

// ==========================================
// Orchestrator Engine Connections
// ==========================================
async function submitUserPrompt(promptText) {
  const contentArea = document.getElementById('response-content-area');
  const drawer = document.getElementById('reflection-drawer');
  const canvas = document.getElementById('connector-canvas');
  
  contentArea.innerHTML = `<p class="loading-placeholder-text">Analyzing reasoning paths & synthesizing reflection profiles...</p>`;
  drawer.classList.add('collapsed');
  drawer.style.display = "none";
  if (canvas) canvas.innerHTML = '';
  
  try {
    const response = await fetch('http://127.0.0.1:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText })
    });
    
    if (!response.ok) throw new Error("Local API connection unavailable.");
    const data = await response.json();
    renderResponsePayload(data);
    
  } catch (error) {
    console.warn("Backend API not running. Launching static mock strategic client simulation fallback...", error);
    setTimeout(() => {
      const lower = promptText.toLowerCase();
      if (lower.includes("format") || lower.includes("clean") || lower.includes("syntax") || lower.includes("regex")) {
        renderResponsePayload({
          response_text: "Here is the cleaned and formatted bibliography in APA style:\n\n1. Maddala, N. (2026). *The Illusion of Authoritative Outputs*. Academic Press.",
          reflection_mode: { status: "inactive", highlights: [], modules: null }
        });
      } else {
        renderResponsePayload(MOCK_STRATEGIC_PAYLOAD);
      }
    }, 800);
  }
}

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  setupAccordionToggles();
  setupResizeObservers();
  
  submitUserPrompt("Should I prioritize PLG growth for our B2B SaaS product?");
  
  const promptInput = document.getElementById('prompt-input');
  const userPromptContent = document.getElementById('user-prompt-content');
  
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const value = promptInput.value.trim();
      if (value) {
        userPromptContent.textContent = value;
        submitUserPrompt(value);
        promptInput.value = "";
      }
    }
  });
});
