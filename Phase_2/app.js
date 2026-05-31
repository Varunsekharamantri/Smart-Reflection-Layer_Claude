/**
 * SMART REFLECTION LAYER - CLIENT CONTROLLER
 * Manages Markdown Highlight Parsing, Dynamic DOM Population, 
 * Smooth Accordion Triggers, and Interactive Hover Synchronizations.
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
// Core Highlight Parser Engine
// ==========================================
function parseTextHighlights(text, highlights) {
  if (!highlights || highlights.length === 0) {
    // Simply split by paragraph and output basic HTML
    return text.split('\n\n').map(p => `<p class="response-para">${escapeHTML(p)}</p>`).join('');
  }

  let parsedHTML = text;
  
  // Sort highlights by length descending to prevent shorter sub-strings 
  // from breaking larger highlights during replacement matching
  const sortedHighlights = [...highlights].sort((a, b) => b.text_span.length - a.text_span.length);
  
  sortedHighlights.forEach(hl => {
    const textSpan = hl.text_span;
    const category = hl.category;
    const id = hl.id;
    
    // Create interactive wrapping tag
    const replacement = `<span class="reflection-highlight category-${category}" data-hl-id="${id}">${escapeHTML(textSpan)}</span>`;
    
    // Replace verbatim string
    parsedHTML = parsedHTML.replaceAll(textSpan, replacement);
  });

  // Wrap resulting paragraphs
  return parsedHTML.split('\n\n').map(p => {
    // Return direct HTML if it contains our span tags, otherwise escape
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
// UI Render & Dynamic Assembly
// ==========================================
function renderResponsePayload(payload) {
  const contentArea = document.getElementById('response-content-area');
  const drawer = document.getElementById('reflection-drawer');
  
  // 1. Render Core Response Text & Inject Dynamic Spans
  const formattedHTML = parseTextHighlights(payload.response_text, payload.reflection_mode.highlights);
  contentArea.innerHTML = formattedHTML;

  // 2. Configure Reflection Drawer status
  if (payload.reflection_mode.status === 'active') {
    drawer.classList.remove('collapsed');
    drawer.style.display = "flex";
    
    // Populate modules
    const modules = payload.reflection_mode.modules;
    
    // Populate Module 1: Assumptions
    const assContent = document.getElementById('content-assumptions');
    assContent.innerHTML = `
      <ul class="card-list">
        ${modules.assumptions.map(item => `
          <li class="card-list-item"><strong>${escapeHTML(item.summary)}</strong>: ${escapeHTML(item.details)}</li>
        `).join('')}
      </ul>
    `;

    // Populate Module 2: Missing Context
    const ctxContent = document.getElementById('content-context');
    ctxContent.innerHTML = `
      <ul class="card-list">
        ${modules.missing_context.map(item => `
          <li class="card-list-item"><strong>${escapeHTML(item.summary)}</strong>: ${escapeHTML(item.details)}</li>
        `).join('')}
      </ul>
    `;

    // Populate Module 3: Uncertainty Boundary
    const uncContent = document.getElementById('content-uncertainty');
    uncContent.innerHTML = `
      <div class="card-text-block">
        ${modules.uncertainty_boundary.map(item => `
          <p><strong>${escapeHTML(item.summary)}</strong>: ${escapeHTML(item.details)}</p>
        `).join('')}
      </div>
    `;

    // Populate Module 4: Alternatives
    const altContent = document.getElementById('content-alternatives');
    altContent.innerHTML = `
      <div class="card-text-block">
        ${modules.alternative_perspectives.map(item => `
          <p><strong>${escapeHTML(item.summary)}</strong>: ${escapeHTML(item.details)}</p>
        `).join('')}
      </div>
    `;

    // Populate Module 5: Prompt Question
    const promptContent = document.getElementById('content-prompt');
    promptContent.innerHTML = `
      <p class="card-prompt-question">"${escapeHTML(modules.reflection_prompt.question)}"</p>
    `;
    
    // Bind all interactive hover sync triggers
    setupInteractiveHoverSync();
    
  } else {
    // Low stakes routing: completely hide reflection mode elements
    drawer.classList.add('collapsed');
    drawer.style.display = "none";
  }
}

// ==========================================
// Interactive Accordion Controller
// ==========================================
function setupAccordionToggles() {
  const mainTrigger = document.getElementById('reflection-trigger-btn');
  const mainDrawer = document.getElementById('reflection-drawer');
  
  // Main Toggle Action
  mainTrigger.addEventListener('click', () => {
    const isCollapsed = mainDrawer.classList.toggle('collapsed');
    mainTrigger.setAttribute('aria-expanded', !isCollapsed);
  });

  // 5 Sub-module Toggles
  const cards = document.querySelectorAll('.reflection-card-accordion');
  cards.forEach(card => {
    const trigger = card.querySelector('.card-trigger');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid triggering main drawer toggle
      
      const wasCollapsed = card.classList.contains('collapsed');
      
      // Close all other cards first for clean workspace logic
      cards.forEach(c => c.classList.add('collapsed'));
      
      if (wasCollapsed) {
        card.classList.remove('collapsed');
      }
    });
  });
}

// ==========================================
// Synced Hover State Framework
// ==========================================
function setupInteractiveHoverSync() {
  const highlights = document.querySelectorAll('.reflection-highlight');
  const cards = document.querySelectorAll('.reflection-card-accordion');

  // Trigger Action: Hover Highlight Spans -> Highlight & Expand Cards
  highlights.forEach(span => {
    const hlId = span.getAttribute('data-hl-id');
    const targetCard = document.querySelector(`.reflection-card-accordion[data-hl-target="${hlId}"]`);

    if (targetCard) {
      span.addEventListener('mouseenter', () => {
        span.classList.add('active');
        targetCard.classList.add('active-glow');
        
        // Dynamic Premium UX: Expand target card on hovering corresponding text
        cards.forEach(c => c.classList.add('collapsed'));
        targetCard.classList.remove('collapsed');
      });

      span.addEventListener('mouseleave', () => {
        span.classList.remove('active');
        targetCard.classList.remove('active-glow');
      });
    }
  });

  // Trigger Action: Hover Cards -> Glow Corresponding Highlight Text
  cards.forEach(card => {
    const targetId = card.getAttribute('data-hl-target');
    if (targetId) {
      const targetSpan = document.querySelector(`.reflection-highlight[data-hl-id="${targetId}"]`);
      
      if (targetSpan) {
        card.addEventListener('mouseenter', () => {
          targetSpan.classList.add('active');
          card.classList.add('active-glow');
        });

        card.addEventListener('mouseleave', () => {
          targetSpan.classList.remove('active');
          card.classList.remove('active-glow');
        });
      }
    }
  });
}

// ==========================================
// Orchestrator Engine Connections
// ==========================================
async function submitUserPrompt(promptText) {
  const chatViewport = document.getElementById('chat-viewport');
  const contentArea = document.getElementById('response-content-area');
  const drawer = document.getElementById('reflection-drawer');
  
  // Show loading skeleton
  contentArea.innerHTML = `<p class="loading-placeholder-text">Analyzing reasoning paths & synthesizing reflection profiles...</p>`;
  drawer.classList.add('collapsed');
  drawer.style.display = "none";
  
  try {
    const response = await fetch('http://127.0.0.1:8000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: promptText })
    });
    
    if (!response.ok) {
      throw new Error("Local API connection unavailable.");
    }
    
    const data = await response.json();
    renderResponsePayload(data);
    
  } catch (error) {
    console.warn("Backend API not running. Launching static mock strategic client simulation fallback...", error);
    // Instant premium mock fallback ensures absolute robustness and usability
    setTimeout(() => {
      // If prompt looks like a low-stakes task, mock low stakes response
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
  
  // Run Default Startup Screen using PLG/B2B SaaS strategic prompt
  submitUserPrompt("Should I prioritize PLG growth for our B2B SaaS product?");
  
  // Setup Chat Form Submissions
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
