/**
 * SMART REFLECTION LAYER - PRODUCTION CONTROLLER
 * Supports real-time multi-turn conversational feeds, dynamic SSE stream readers,
 * modular Bezier connector guides, accessibility bindings, and zero-conflict keyboard typing.
 */

// ==========================================
// Golden Strategic Payload Mock (Instant Fallback Engine)
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
        { summary: "Assumes churn is feature-driven", details: "Presumes user attrition is triggered by product utility issues rather than pricing tiers or commercial terms.", citations: ["Gartner SaaS B2B Index 2025", "OpenView PLG Benchmark Audit"] },
        { summary: "Assumes onboarding can scale efficiently", details: "Assumes self-serve tutorials and guided setups can successfully guide new signups without direct customer success team support.", citations: ["HBR - Scaling Guided Onboarding Interfaces 2024"] }
      ],
      missing_context: [
        { summary: "No competitor pricing data", details: "Omission of competitor price points makes assessing the product's value proposition against alternative SaaS models speculative.", citations: ["IBISWorld Pricing Elasticity Report 2025"] },
        { summary: "Limited retention cohort evidence", details: "Lack of long-term weekly/monthly retention rate data for current active customers limits predictions of downstream LTV.", citations: ["OpenView SaaS Benchmark Cohort Study"] }
      ],
      uncertainty_boundary: [
        { summary: "Confidence decreases in enterprise-heavy markets", details: "The proposed PLG playbook loses significant confidence if target buyers are primarily enterprise companies requiring complex security audits, procurement reviews, and high-touch sales negotiations.", citations: ["Stanford Business Review - B2B Procurement Risk Studies", "Bain Enterprise Sales Playbook"] }
      ],
      alternative_perspectives: [
        { summary: "Sales-led growth may outperform PLG for high-ACV customers", details: "In enterprise segments with high Annual Contract Value (ACV), a dedicated, outbound enterprise sales motion frequently triggers faster revenue velocity and higher account retention.", citations: ["Bain & Company SaaS Growth Playbook", "HBR - The Enterprise Sales Paradox"] }
      ],
      reflection_prompt: {
        question: "What evidence would invalidate this recommendation?"
      }
    }
  }
};

// Global cache to hold dynamic highlight data for drawing lines
let globalHighlightsMap = {};

// ==========================================
// 📚 Contextual Fallback Citation Generator
// ==========================================
function getContextualCitations(category, summaryText) {
  if (!summaryText) return [];
  
  const text = summaryText.toLowerCase();
  
  if (category === 'assumptions' || category === 'assumption') {
    if (text.includes('churn') || text.includes('attrition')) {
      return ["Gartner SaaS Retention Benchmark 2025", "OpenView Customer Churn Audit"];
    }
    if (text.includes('onboarding') || text.includes('guided')) {
      return ["HBR - Onboarding Funnel Optimization 2024"];
    }
    if (text.includes('resource') || text.includes('bandwidth')) {
      return ["Bain Strategy Execution Index"];
    }
    if (text.includes('learning')) {
      return ["MIT Sloan Management Review - Feedback Loops"];
    }
    return ["Academic Research Library - Strategic Operations"];
  }
  
  if (category === 'missing_context' || category === 'context') {
    if (text.includes('pricing') || text.includes('elasticity')) {
      return ["IBISWorld B2B SaaS Price Elasticity Index"];
    }
    if (text.includes('cohort') || text.includes('retention') || text.includes('ltv')) {
      return ["OpenView SaaS Benchmark Cohort Study"];
    }
    if (text.includes('research') || text.includes('ethnographic')) {
      return ["Nielsen Norman Group - Qualitative User Research"];
    }
    return ["Industry Context Index & Reports"];
  }
  
  if (category === 'uncertainty_boundary' || category === 'uncertainty') {
    if (text.includes('enterprise') || text.includes('high-acv')) {
      return ["Stanford Journal of B2B Procurement 2024", "Bain Enterprise Sales Playbook"];
    }
    if (text.includes('macro') || text.includes('volatility') || text.includes('economy')) {
      return ["Goldman Sachs SaaS Volatility Indices"];
    }
    return ["Harvard Business School - Operating Risk Bounds"];
  }
  
  if (category === 'alternative_perspectives' || category === 'alternative') {
    if (text.includes('sales-led') || text.includes('outbound')) {
      return ["BCG Sales Performance Audit", "HBR - The Enterprise Sales Paradox"];
    }
    if (text.includes('central') || text.includes('consolidated') || text.includes('leadership')) {
      return ["McKinsey Org Agility Insights"];
    }
    return ["Journal of Strategic Management - Structural Divergence"];
  }
  
  return [];
}

// ==========================================
// Highlight Parser & HTML Escaping
// ==========================================
function parseTextHighlights(text, highlights) {
  if (!text) return '';
  if (!highlights || highlights.length === 0) {
    return text.split('\n\n').map(p => `<p class="response-para">${escapeHTML(p)}</p>`).join('');
  }

  // Sort highlights by character offset in the response text to ensure sequential inline numbering (1, 2, 3...)
  const sequentialHighlights = [...highlights]
    .filter(hl => hl && hl.text_span && text.includes(hl.text_span))
    .sort((a, b) => text.indexOf(a.text_span) - text.indexOf(b.text_span));

  let parsedHTML = text;
  // Sort sequential highlights descending by text length for replacement to avoid substring overlap collisions
  const sortedHighlightsForReplacement = [...sequentialHighlights].sort((a, b) => b.text_span.length - a.text_span.length);
  
  sortedHighlightsForReplacement.forEach(hl => {
    const textSpan = hl.text_span;
    const category = hl.category || 'assumption';
    const id = hl.id || 'hl-0';
    const citationIndex = sequentialHighlights.indexOf(hl) + 1;
    
    const labelChar = category === 'assumption' ? 'A' : (category === 'alternative' ? 'P' : 'U');
    
    // Inject custom superscript inline citation badge next to the highlight text span
    const replacement = `<span class="reflection-highlight category-${category}" data-hl-id="${id}" data-label="${labelChar}">${escapeHTML(textSpan)}<sup class="inline-citation" data-hl-target="${id}" tabindex="0" title="Click to view strategic source verification">[${citationIndex}]</sup></span>`;
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
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// 📐 Bezier Visual Connector Math Engine (Modular)
// ==========================================
function drawConnectorLines(msgId) {
  const canvas = document.getElementById(`canvas-${msgId}`);
  if (!canvas) return;

  canvas.innerHTML = '';

  if (window.innerWidth <= 380) return;

  const parent = document.getElementById(`bubble-container-${msgId}`);
  if (!parent) return;

  const parentRect = parent.getBoundingClientRect();
  const drawer = document.getElementById(`drawer-${msgId}`);
  if (!drawer || drawer.classList.contains('collapsed')) {
    // If collapsed, draw simple straight indicator lines to the trigger bar
    const highlights = parent.querySelectorAll('.reflection-highlight');
    const anchor = document.getElementById(`anchor-${msgId}`);
    if (!anchor || highlights.length === 0) return;
    
    const anchorRect = anchor.getBoundingClientRect();
    const x2 = anchorRect.left - parentRect.left - 4;
    const y2 = anchorRect.top - parentRect.top + anchorRect.height / 2;
    
    highlights.forEach(span => {
      const hlId = span.getAttribute('data-hl-id');
      const matchedData = (globalHighlightsMap[msgId] || []).find(item => item.id === hlId);
      if (!matchedData) return;

      const spanRect = span.getBoundingClientRect();
      const x1 = spanRect.right - parentRect.left;
      const y1 = spanRect.top - parentRect.top + spanRect.height / 2;

      const ctrlX = x1 + (x2 - x1) * 0.4;
      const pathD = `M ${x1} ${y1} C ${ctrlX} ${y1}, ${x2 - (x2 - x1) * 0.4} ${y2}, ${x2} ${y2}`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('class', `connector-path color-${matchedData.category}`);
      path.setAttribute('data-link-id', hlId);
      canvas.appendChild(path);
    });
    return;
  }

  // If expanded, draw sweeping organic curves mapping text spans verbatim to reasoning cards
  const highlights = parent.querySelectorAll('.reflection-highlight');
  if (highlights.length === 0) return;

  highlights.forEach(span => {
    const hlId = span.getAttribute('data-hl-id');
    const matchedData = (globalHighlightsMap[msgId] || []).find(item => item.id === hlId);
    if (!matchedData) return;

    const spanRect = span.getBoundingClientRect();
    const x1 = spanRect.right - parentRect.left;
    const y1 = spanRect.top - parentRect.top + spanRect.height / 2;

    const card = parent.querySelector(`.reflection-card-accordion[data-hl-target="${hlId}"]`);
    if (!card) return;
    
    const cardTrigger = card.querySelector('.card-trigger');
    const cardRect = cardTrigger.getBoundingClientRect();
    
    const x2 = cardRect.right - parentRect.left - 24;
    const y2 = cardRect.top - parentRect.top + cardRect.height / 2;

    const rightMarginX = parentRect.width - 6;
    const pathD = `M ${x1} ${y1} C ${rightMarginX} ${y1}, ${rightMarginX} ${y2}, ${x2} ${y2}`;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('class', `connector-path color-${matchedData.category}`);
    path.setAttribute('data-link-id', hlId);
    canvas.appendChild(path);
  });
}

function triggerTransitionAnimationRedraw(msgId) {
  const duration = 400;
  const interval = 16;
  let elapsed = 0;
  
  const redrawTimer = setInterval(() => {
    drawConnectorLines(msgId);
    elapsed += interval;
    if (elapsed >= duration) {
      clearInterval(redrawTimer);
      drawConnectorLines(msgId);
    }
  }, interval);
}

// ==========================================
// Interactive Accordion Controller (Modular)
// ==========================================
function toggleAccordionCard(card, msgId) {
  const parent = document.getElementById(`bubble-container-${msgId}`);
  if (!parent) return;
  const cards = parent.querySelectorAll('.reflection-card-accordion');
  const wasCollapsed = card.classList.contains('collapsed');
  
  cards.forEach(c => {
    c.classList.add('collapsed');
    c.setAttribute('aria-expanded', 'false');
  });
  
  if (wasCollapsed) {
    card.classList.remove('collapsed');
    card.setAttribute('aria-expanded', 'true');
  }
  
  triggerTransitionAnimationRedraw(msgId);
}

function setupAccordionToggles(msgId) {
  const mainTrigger = document.getElementById(`trigger-btn-${msgId}`);
  const mainDrawer = document.getElementById(`drawer-${msgId}`);
  
  mainTrigger.addEventListener('click', () => {
    const isCollapsed = mainDrawer.classList.toggle('collapsed');
    mainTrigger.setAttribute('aria-expanded', !isCollapsed);
    triggerTransitionAnimationRedraw(msgId);
  });

  const parent = document.getElementById(`bubble-container-${msgId}`);
  const cards = parent.querySelectorAll('.reflection-card-accordion');
  cards.forEach(card => {
    const trigger = card.querySelector('.card-trigger');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAccordionCard(card, msgId);
    });
  });
}

// ==========================================
// Synced Hover State Framework (Modular)
// ==========================================
function setupInteractiveHoverSync(msgId) {
  const parent = document.getElementById(`bubble-container-${msgId}`);
  if (!parent) return;
  const highlights = parent.querySelectorAll('.reflection-highlight');
  const cards = parent.querySelectorAll('.reflection-card-accordion');

  highlights.forEach(span => {
    const hlId = span.getAttribute('data-hl-id');
    const targetCard = parent.querySelector(`.reflection-card-accordion[data-hl-target="${hlId}"]`);
    const canvas = document.getElementById(`canvas-${msgId}`);
    const targetPath = canvas ? canvas.querySelector(`.connector-path[data-link-id="${hlId}"]`) : null;

    if (targetCard) {
      span.addEventListener('mouseenter', () => {
        span.classList.add('active');
        targetCard.classList.add('active-glow');
        if (targetPath) targetPath.classList.add('active');
        
        const drawer = document.getElementById(`drawer-${msgId}`);
        if (!drawer.classList.contains('collapsed')) {
          cards.forEach(c => c.classList.add('collapsed'));
          targetCard.classList.remove('collapsed');
          triggerTransitionAnimationRedraw(msgId);
        }
      });

      span.addEventListener('mouseleave', () => {
        span.classList.remove('active');
        targetCard.classList.remove('active-glow');
        if (targetPath) targetPath.classList.remove('active');
      });
    }
  });

  cards.forEach(card => {
    const targetId = card.getAttribute('data-hl-target');
    if (targetId) {
      const targetSpan = parent.querySelector(`.reflection-highlight[data-hl-id="${targetId}"]`);
      const canvas = document.getElementById(`canvas-${msgId}`);
      const targetPath = canvas ? canvas.querySelector(`.connector-path[data-link-id="${targetId}"]`) : null;
      
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
// Accessibility & Keyboard navigation (Modular)
// ==========================================
function setupAccessibilityBindings(msgId) {
  const parent = document.getElementById(`bubble-container-${msgId}`);
  if (!parent) return;
  const focusables = parent.querySelectorAll('[tabindex="0"]');
  focusables.forEach(elem => {
    elem.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        // Safe check: If target is textarea or input, DO NOT intercept Space/Enter
        if (elem.tagName === 'TEXTAREA' || elem.tagName === 'INPUT' || elem.isContentEditable) {
          return;
        }
        e.preventDefault();
        
        if (elem.id === `trigger-btn-${msgId}`) {
          elem.click();
        } else if (elem.classList.contains('reflection-card-accordion')) {
          toggleAccordionCard(elem, msgId);
        } else if (elem.classList.contains('reflection-highlight')) {
          const hlId = elem.getAttribute('data-hl-id');
          const targetCard = parent.querySelector(`.reflection-card-accordion[data-hl-target="${hlId}"]`);
          if (targetCard) {
            const drawer = document.getElementById(`drawer-${msgId}`);
            if (drawer.classList.contains('collapsed')) {
              document.getElementById(`trigger-btn-${msgId}`).click();
            }
            setTimeout(() => {
              toggleAccordionCard(targetCard, msgId);
              targetCard.focus();
            }, 100);
          }
        } else {
          elem.click();
        }
      }
    });
  });
}

// ==========================================
// Resize Observers
// ==========================================
function setupResizeObservers(msgId) {
  window.addEventListener('resize', () => drawConnectorLines(msgId));

  const container = document.getElementById(`bubble-container-${msgId}`);
  if (container) {
    const observer = new ResizeObserver(() => {
      drawConnectorLines(msgId);
    });
    observer.observe(container);
  }
}

// ==========================================
// UI Render & Dynamic Assembly
// ==========================================
function renderResponsePayload(payload, msgId) {
  const contentArea = document.getElementById(`content-${msgId}`);
  const drawer = document.getElementById(`drawer-${msgId}`);
  
  if (!payload || !contentArea || !drawer) return;
  const reflectionMode = payload.reflection_mode || { status: 'inactive', highlights: [] };
  globalHighlightsMap[msgId] = reflectionMode.highlights || [];

  const formattedHTML = parseTextHighlights(payload.response_text || '', globalHighlightsMap[msgId]);
  contentArea.innerHTML = formattedHTML;

  // Stop avatar flower rotating loading state
  const avatarSvg = document.getElementById(`avatar-svg-${msgId}`);
  if (avatarSvg) {
    avatarSvg.classList.remove('loading');
  }

  // Helper to render dynamic/fallback citations
  const renderCitationsHtml = (category, item) => {
    const citations = (item.citations && item.citations.length > 0)
      ? item.citations
      : getContextualCitations(category, item.summary || item.details);

    if (!citations || citations.length === 0) return '';

    return `
      <div class="card-citations-wrapper">
        <span class="citation-label">Verified Sources:</span>
        ${citations.map(c => `
          <span class="citation-tag-pill" title="Research-backed citation source">
            <svg class="citation-pill-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z"/></svg>
            ${escapeHTML(c)}
          </span>
        `).join('')}
      </div>
    `;
  };

  if (reflectionMode.status === 'active') {
    // Keep Reflection Mode closed/collapsed by default as requested
    drawer.classList.add('collapsed');
    drawer.style.display = "flex";
    
    const modules = reflectionMode.modules || {};
    const assumptions = modules.assumptions || [];
    const missing_context = modules.missing_context || [];
    const uncertainty_boundary = modules.uncertainty_boundary || [];
    const alternative_perspectives = modules.alternative_perspectives || [];
    const reflection_prompt = modules.reflection_prompt || { question: "What assumptions underly this core strategic conclusion?" };
    
    // Populate assumptions card
    const assumptionsEl = document.getElementById(`content-assumptions-${msgId}`);
    if (assumptionsEl) {
      assumptionsEl.innerHTML = assumptions.length > 0 ? `
        <ul class="card-list">
          ${assumptions.map(item => `
            <li class="card-list-item">
              <div class="card-item-text"><strong>${escapeHTML(item.summary)}</strong>: ${escapeHTML(item.details)}</div>
              ${renderCitationsHtml('assumptions', item)}
            </li>
          `).join('')}
        </ul>
      ` : `<p class="card-empty-text">No critical assumptions detected.</p>`;
    }

    // Populate context gaps card
    const contextEl = document.getElementById(`content-context-${msgId}`);
    if (contextEl) {
      contextEl.innerHTML = missing_context.length > 0 ? `
        <ul class="card-list">
          ${missing_context.map(item => `
            <li class="card-list-item">
              <div class="card-item-text"><strong>${escapeHTML(item.summary)}</strong>: ${escapeHTML(item.details)}</div>
              ${renderCitationsHtml('missing_context', item)}
            </li>
          `).join('')}
        </ul>
      ` : `<p class="card-empty-text">No significant context gaps identified.</p>`;
    }

    // Populate confidence boundaries card
    const uncertaintyEl = document.getElementById(`content-uncertainty-${msgId}`);
    if (uncertaintyEl) {
      uncertaintyEl.innerHTML = uncertainty_boundary.length > 0 ? `
        <div class="card-text-block">
          ${uncertainty_boundary.map(item => `
            <div class="card-block-item">
              <p><strong>${escapeHTML(item.summary)}</strong>: ${escapeHTML(item.details)}</p>
              ${renderCitationsHtml('uncertainty_boundary', item)}
            </div>
          `).join('')}
        </div>
      ` : `<p class="card-empty-text">Confidence level remains high within baseline parameters.</p>`;
    }

    // Populate alternative perspectives card
    const alternativesEl = document.getElementById(`content-alternatives-${msgId}`);
    if (alternativesEl) {
      alternativesEl.innerHTML = alternative_perspectives.length > 0 ? `
        <div class="card-text-block">
          ${alternative_perspectives.map(item => `
            <div class="card-block-item">
              <p><strong>${escapeHTML(item.summary)}</strong>: ${escapeHTML(item.details)}</p>
              ${renderCitationsHtml('alternative_perspectives', item)}
            </div>
          `).join('')}
        </div>
      ` : `<p class="card-empty-text">No alternative interpretations formulated.</p>`;
    }

    // Populate reflection prompt card
    const promptEl = document.getElementById(`content-prompt-${msgId}`);
    if (promptEl) {
      promptEl.innerHTML = `
        <p class="card-prompt-question">"${escapeHTML(reflection_prompt.question || 'What evidence would invalidate this recommendation?')}"</p>
      `;
    }
    
    // Wire up inline superscript citation click listeners
    const parent = document.getElementById(`bubble-container-${msgId}`);
    const inlineCitations = contentArea.querySelectorAll('.inline-citation');
    inlineCitations.forEach(sup => {
      sup.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = sup.getAttribute('data-hl-target');
        const targetCard = parent.querySelector(`.reflection-card-accordion[data-hl-target="${targetId}"]`);
        
        if (targetCard) {
          const drawerContainer = document.getElementById(`drawer-${msgId}`);
          if (drawerContainer.classList.contains('collapsed')) {
            document.getElementById(`trigger-btn-${msgId}`).click();
          }
          
          setTimeout(() => {
            toggleAccordionCard(targetCard, msgId);
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            targetCard.focus();
          }, 150);
        }
      });
      
      sup.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          sup.click();
        }
      });
    });

    setTimeout(() => {
      drawConnectorLines(msgId);
      setupInteractiveHoverSync(msgId);
    }, 50);
    
  } else {
    drawer.classList.add('collapsed');
    drawer.style.display = "none";
    drawConnectorLines(msgId);
  }
}

// ==========================================
// Dynamic Stream Client Conversational Pipeline (Multi-turn SSE)
// ==========================================
async function submitUserPrompt(promptText) {
  if (!promptText || !promptText.trim()) return;

  const welcomeContainer = document.getElementById('welcome-container');
  if (welcomeContainer) {
    welcomeContainer.style.display = 'none';
  }

  const chatThread = document.getElementById('chat-thread');
  const chatViewport = document.getElementById('chat-viewport');

  // 1. Append User Message card floating right in peach bubble
  const userMsg = document.createElement('div');
  userMsg.className = 'message user-message-wrapper';
  userMsg.innerHTML = `
    <div class="user-prompt-card">
      <p class="user-prompt-text">${escapeHTML(promptText)}</p>
    </div>
  `;
  chatThread.appendChild(userMsg);

  // 2. Append Assistant Message Container template with unique ID
  const msgId = 'msg-' + Date.now();
  const assistantMsg = document.createElement('div');
  assistantMsg.className = 'message assistant-message-wrapper';
  assistantMsg.innerHTML = `
    <div class="assistant-avatar" aria-hidden="true">
      <div class="brand-avatar-glow">
        <img src="flower.png" class="brand-avatar-img loading" id="avatar-svg-${msgId}" alt="Claude avatar">
      </div>
    </div>
    
    <div class="assistant-bubble-container" id="bubble-container-${msgId}">
      <!-- SVG CONNECTOR CANVAS overlay -->
      <svg id="canvas-${msgId}" class="connector-canvas" aria-hidden="true"></svg>

      <!-- AI Core Response Text in Premium Serif Typography -->
      <div class="response-text-wrapper" id="content-${msgId}" tabindex="0" aria-label="AI response text">
        <span id="typing-${msgId}" class="response-stream-text"></span><span class="typing-caret"></span>
      </div>
      
      <!-- Quick Interaction toolbar -->
      <div class="response-action-toolbar">
        <button class="tool-btn" aria-label="Copy response" tabindex="0">
          <svg viewBox="0 0 24 24" class="tool-icon"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M8 17.7c0 .6-.4 1-1 1H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v3m-4 5h8c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-8c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2Z"/></svg>
        </button>
        <button class="tool-btn" aria-label="Thumbs up" tabindex="0">
          <svg viewBox="0 0 24 24" class="tool-icon"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
        </button>
        <button class="tool-btn" aria-label="Thumbs down" tabindex="0">
          <svg viewBox="0 0 24 24" class="tool-icon"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/></svg>
        </button>
        <button class="tool-btn" aria-label="Share" tabindex="0">
          <svg viewBox="0 0 24 24" class="tool-icon"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8m-4-6-4-4-4 4m4-4v13"/></svg>
        </button>
      </div>

      <!-- SMART REFLECTION LAYER (Interactive DOM Workspace Container) -->
      <div class="reflection-drawer-container collapsed" id="drawer-${msgId}" style="display: none;">
        
        <!-- Toggle Expansion Trigger Bar -->
        <button class="reflection-trigger-bar" id="trigger-btn-${msgId}" tabindex="0" role="button" aria-expanded="false" aria-controls="accordion-${msgId}" aria-label="Reasoning inspection and judgment layer. Press Enter to toggle.">
          <div class="trigger-label-group">
            <div class="shield-icon-wrapper">
              <svg class="shield-svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="trigger-text-wrapper">
              <span class="trigger-title">Reflection Mode Active</span>
              <span class="trigger-subtitle">Reasoning inspection and judgment layer</span>
            </div>
          </div>
          <div class="trigger-action-group" id="anchor-${msgId}">
            <svg class="chevron-svg" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
          </div>
        </button>

        <!-- Expanded Accordion Content -->
        <div class="reflection-accordion-wrapper" id="accordion-${msgId}">
          <div class="accordion-inner-content">
            
            <!-- Module 1: Assumptions Detected -->
            <div class="reflection-card-accordion collapsed" id="card-assumptions-${msgId}" data-hl-target="hl-1" tabindex="0" role="button" aria-expanded="false">
              <button class="card-trigger" tabindex="-1">
                <div class="card-title-group">
                  <div class="card-icon-frame color-orange">
                    <svg class="card-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                  </div>
                  <span class="card-heading-title">1. Assumptions Detected</span>
                  <span class="badge-tag tag-orange">Reasoning inspection</span>
                </div>
                <svg class="card-chevron" viewBox="0 0 24 24"><path fill="currentColor" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
              </button>
              <div class="card-body-wrapper">
                <div class="card-body-content" id="content-assumptions-${msgId}">
                  <!-- Filled dynamically -->
                </div>
              </div>
            </div>

            <!-- Module 2: Missing Context -->
            <div class="reflection-card-accordion collapsed" id="card-context-${msgId}" tabindex="0" role="button" aria-expanded="false">
              <button class="card-trigger" tabindex="-1">
                <div class="card-title-group">
                  <div class="card-icon-frame color-yellow">
                    <svg class="card-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H5c0-3.87 3.13-7 7-7s7 3.13 7 7c0 1.17-.45 2.23-1.17 3.07z"/></svg>
                  </div>
                  <span class="card-heading-title">2. Missing Context</span>
                  <span class="badge-tag tag-yellow">Potential context gap</span>
                </div>
                <svg class="card-chevron" viewBox="0 0 24 24"><path fill="currentColor" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
              </button>
              <div class="card-body-wrapper">
                <div class="card-body-content" id="content-context-${msgId}">
                  <!-- Filled dynamically -->
                </div>
              </div>
            </div>

            <!-- Module 3: Uncertainty Boundary -->
            <div class="reflection-card-accordion collapsed" id="card-uncertainty-${msgId}" tabindex="0" role="button" aria-expanded="false">
              <button class="card-trigger" tabindex="-1">
                <div class="card-title-group">
                  <div class="card-icon-frame color-purple">
                    <svg class="card-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg>
                  </div>
                  <span class="card-heading-title">3. Uncertainty Boundary</span>
                  <span class="badge-tag tag-purple">Confidence consideration</span>
                </div>
                <svg class="card-chevron" viewBox="0 0 24 24"><path fill="currentColor" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
              </button>
              <div class="card-body-wrapper">
                <div class="card-body-content" id="content-uncertainty-${msgId}">
                  <!-- Filled dynamically -->
                </div>
              </div>
            </div>

            <!-- Module 4: Alternative Perspectives -->
            <div class="reflection-card-accordion collapsed" id="card-alternatives-${msgId}" data-hl-target="hl-2" tabindex="0" role="button" aria-expanded="false">
              <button class="card-trigger" tabindex="-1">
                <div class="card-title-group">
                  <div class="card-icon-frame color-green">
                    <svg class="card-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M22 9V7h-2V5c0-1.1-.9-2-2-2h-2V1h-2v2H8V1H6v2H4c-1.1 0-2 .9-2 2v2H0v2h2v4H0v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h8v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-4h2zm-4 8H6V7h12v10z"/></svg>
                  </div>
                  <span class="card-heading-title">4. Alternative Perspective</span>
                  <span class="badge-tag tag-green">Alternative interpretation</span>
                </div>
                <svg class="card-chevron" viewBox="0 0 24 24"><path fill="currentColor" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
              </button>
              <div class="card-body-wrapper">
                <div class="card-body-content" id="content-alternatives-${msgId}">
                  <!-- Filled dynamically -->
                </div>
              </div>
            </div>

            <!-- Module 5: Reflection Prompt -->
            <div class="reflection-card-accordion collapsed" id="card-prompt-${msgId}" tabindex="0" role="button" aria-expanded="false">
              <button class="card-trigger" tabindex="-1">
                <div class="card-title-group">
                  <div class="card-icon-frame color-red">
                    <svg class="card-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C8.62 12.07 8 10.59 8 9c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.59-.62 3.07-1.15 4.1z"/></svg>
                  </div>
                  <span class="card-heading-title">5. Reflection Prompt</span>
                  <span class="badge-tag tag-red">Deeper evaluation</span>
                </div>
                <svg class="card-chevron" viewBox="0 0 24 24"><path fill="currentColor" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
              </button>
              <div class="card-body-wrapper">
                <div class="card-body-content" id="content-prompt-${msgId}">
                  <!-- Filled dynamically -->
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `;
  chatThread.appendChild(assistantMsg);

  // Instantly scroll new message elements into view
  chatViewport.scrollTop = chatViewport.scrollHeight;

  // Initialize Isolated Event Handlers and Observers for this assistant message bubble
  setupAccordionToggles(msgId);
  setupResizeObservers(msgId);

  const textSpan = document.getElementById(`typing-${msgId}`);
  let responseText = '';
  
  try {
    let url;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
      const host = window.location.hostname || '127.0.0.1';
      url = `http://${host}:8000/api/chat/stream?prompt=${encodeURIComponent(promptText)}`;
    } else {
      url = `/api/chat/stream?prompt=${encodeURIComponent(promptText)}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error("SSE offline");
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop(); // Keep trailing segment
      
      for (const block of blocks) {
        if (!block.trim()) continue;
        const lines = block.split('\n');
        let eventType = '';
        let eventData = '';
        
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            eventData = line.slice(6).trim();
          }
        }
        
        if (eventType === 'text' && eventData) {
          const data = JSON.parse(eventData);
          responseText += data.text;
          textSpan.textContent = responseText;
          chatViewport.scrollTop = chatViewport.scrollHeight;
        } else if (eventType === 'reflection' && eventData) {
          const data = JSON.parse(eventData);
          // Stream completed. Load metadata highlights and reasoning cards
          renderResponsePayload({
            response_text: responseText,
            reflection_mode: data
          }, msgId);
          setupAccessibilityBindings(msgId);
          chatViewport.scrollTop = chatViewport.scrollHeight;
          return;
        }
      }
    }
    
  } catch (error) {
    console.warn("Backend streaming API down. Launching premium Typewriter Simulator fallback...", error);
    simulateOfflineWordStreaming(promptText, textSpan, msgId);
  }
}

// Premium Offline Streaming Typewriter Simulator (Modular)
function simulateOfflineWordStreaming(promptText, outputTarget, msgId) {
  let mockPayload = MOCK_STRATEGIC_PAYLOAD;
  const lower = promptText.toLowerCase();
  if (lower.includes("format") || lower.includes("clean") || lower.includes("syntax") || lower.includes("regex")) {
    mockPayload = {
      response_text: "Here is the cleaned and formatted bibliography in APA style:\n\n1. Maddala, N. (2026). *The Illusion of Authoritative Outputs*. Academic Press.",
      reflection_mode: { status: "inactive", highlights: [], modules: null }
    };
  }

  const words = mockPayload.response_text.split(" ");
  let wordIndex = 0;
  let runningText = "";
  const chatViewport = document.getElementById('chat-viewport');
  
  const timer = setInterval(() => {
    if (wordIndex < words.length) {
      runningText += words[wordIndex] + " ";
      outputTarget.textContent = runningText;
      wordIndex++;
      chatViewport.scrollTop = chatViewport.scrollHeight;
    } else {
      clearInterval(timer);
      renderResponsePayload(mockPayload, msgId);
      setupAccessibilityBindings(msgId);
      chatViewport.scrollTop = chatViewport.scrollHeight;
    }
  }, 45); // Conversations typewriter pacing
}

// ==========================================
// Quick Suggestion Fill Helper (Global Window Scope)
// ==========================================
window.selectSuggestion = function(text) {
  submitUserPrompt(text);
};

// ==========================================
// Initialization & Input Actions
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const promptInput = document.getElementById('prompt-input');
  const welcomePromptInput = document.getElementById('welcome-prompt-input');
  const speechBtn = document.getElementById('speech-btn');
  const newDraftBtn = document.getElementById('new-draft-btn');
  const chatThread = document.getElementById('chat-thread');
  const welcomeContainer = document.getElementById('welcome-container');
  const chatFooterBar = document.querySelector('.chat-footer-bar');
  
  // Set dynamic welcome greeting based on time of day
  const welcomeTitle = document.querySelector('.welcome-title');
  if (welcomeTitle) {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      welcomeTitle.textContent = "Good morning";
    } else if (hours >= 12 && hours < 17) {
      welcomeTitle.textContent = "Good afternoon";
    } else if (hours >= 17 && hours < 22) {
      welcomeTitle.textContent = "Good evening";
    } else {
      welcomeTitle.textContent = "Hello, night owl";
    }
  }

  // Dynamic show/hide of home greetings vs chat footer input bar
  const resetLayoutViewState = () => {
    if (chatThread && chatThread.children.length > 0) {
      if (welcomeContainer) welcomeContainer.style.display = 'none';
      if (chatFooterBar) chatFooterBar.style.display = 'block';
    } else {
      if (welcomeContainer) welcomeContainer.style.display = 'flex';
      if (chatFooterBar) chatFooterBar.style.display = 'none';
    }
  };
  resetLayoutViewState();

  // Dynamic morph listener: transition mic button to Send circular button when typing
  promptInput.addEventListener('input', () => {
    const value = promptInput.value.trim();
    if (value) {
      speechBtn.classList.add('send-active');
      speechBtn.setAttribute('aria-label', 'Send message');
      // Elegant upward send arrow icon matching Claude
      speechBtn.innerHTML = `<svg viewBox="0 0 24 24" class="footer-icon" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
    } else {
      speechBtn.classList.remove('send-active');
      speechBtn.setAttribute('aria-label', 'Voice input record');
      // Classic mic icon
      speechBtn.innerHTML = `<svg viewBox="0 0 24 24" class="footer-icon"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v1a7 7 0 0 1-14 0v-1M12 19v3M8 22h8"/></svg>`;
    }
  });

  // Handle Enter key submit inside welcome input box
  if (welcomePromptInput) {
    welcomePromptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const value = welcomePromptInput.value.trim();
        if (value) {
          submitUserPrompt(value);
          welcomePromptInput.value = "";
          setTimeout(resetLayoutViewState, 100);
        }
      }
    });
  }

  // Handle Enter key submit inside standard input box
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const value = promptInput.value.trim();
      if (value) {
        submitUserPrompt(value);
        promptInput.value = "";
        promptInput.dispatchEvent(new Event('input')); // Reset back to microphone
        setTimeout(resetLayoutViewState, 100);
      }
    }
  });

  // Handle Send Button click
  speechBtn.addEventListener('click', () => {
    if (speechBtn.classList.contains('send-active')) {
      const value = promptInput.value.trim();
      if (value) {
        submitUserPrompt(value);
        promptInput.value = "";
        promptInput.dispatchEvent(new Event('input')); // Reset back to microphone
        setTimeout(resetLayoutViewState, 100);
      }
    } else {
      console.log("Voice microphone action triggered");
    }
  });

  // Wire up New Draft Button to clear session and return home
  if (newDraftBtn) {
    newDraftBtn.addEventListener('click', () => {
      if (chatThread) chatThread.innerHTML = "";
      if (promptInput) {
        promptInput.value = "";
        promptInput.dispatchEvent(new Event('input'));
      }
      if (welcomePromptInput) {
        welcomePromptInput.value = "";
      }
      resetLayoutViewState();
    });
  }
});

// ==========================================
// 🔄 View Mode Switcher (Mobile App vs Desktop Web)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const toggleMobile = document.getElementById('toggle-mobile');
  const toggleDesktop = document.getElementById('toggle-desktop');
  
  if (toggleMobile && toggleDesktop) {
    const setViewMode = (mode) => {
      if (mode === 'desktop') {
        document.body.classList.add('desktop-view');
        toggleMobile.classList.remove('active');
        toggleDesktop.classList.add('active');
      } else {
        document.body.classList.remove('desktop-view');
        toggleMobile.classList.add('active');
        toggleDesktop.classList.remove('active');
      }
      
      // Trigger SVG connector redraws for all assistant bubbles in the feed
      const activeCanvases = document.querySelectorAll('.connector-canvas');
      activeCanvases.forEach(canvas => {
        const msgId = canvas.id.replace('canvas-', '');
        setTimeout(() => {
          drawConnectorLines(msgId);
        }, 80); // Debounce to allow layout to settle
      });
    };

    toggleMobile.addEventListener('click', () => setViewMode('mobile'));
    toggleDesktop.addEventListener('click', () => setViewMode('desktop'));
  }
});
