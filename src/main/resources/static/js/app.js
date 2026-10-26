/**
 * Spring AI Studio • Comprehensive Client Controller
 * Mapped to backend endpoints in GenAiController.java:
 *   1. GET /recipe-creator?ingredients=...&cuisine=...&dietaryRestrictions=...
 *   2. GET /generate-image?prompt=...
 *   3. GET /ask-ai?prompt=...
 *   4. GET /ask-ai-options?prompt=...
 */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================================
     1. MODULE SWITCHING (TABS)
     ========================================================================= */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const modulePanels = document.querySelectorAll('.module-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPanelId = btn.getAttribute('data-target');

      // Update tabs state
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Update panels
      modulePanels.forEach(panel => {
        if (panel.id === targetPanelId) {
          panel.classList.add('active');
          panel.removeAttribute('hidden');
        } else {
          panel.classList.remove('active');
          panel.setAttribute('hidden', 'true');
        }
      });
    });
  });

  /* =========================================================================
     2. GLOBAL TOAST NOTIFICATIONS
     ========================================================================= */
  const toast = document.getElementById('toast');
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  /* =========================================================================
     3. MODULE 1: RECIPE GENERATOR (/recipe-creator)
     ========================================================================= */
  const recipeForm = document.getElementById('recipe-form');
  const recipeIngredients = document.getElementById('recipe-ingredients');
  const recipeCuisine = document.getElementById('recipe-cuisine');
  const btnClearIngredients = document.getElementById('btn-clear-ingredients');
  const recipeChips = document.querySelectorAll('.chip[data-val]');

  const recipeEmpty = document.getElementById('recipe-empty');
  const recipeLoading = document.getElementById('recipe-loading');
  const recipeError = document.getElementById('recipe-error');
  const recipeErrorText = document.getElementById('recipe-error-text');
  const recipeOutput = document.getElementById('recipe-output');
  const btnRetryRecipe = document.getElementById('btn-retry-recipe');

  const recipeImg = document.getElementById('recipe-img');
  const recipeHeading = document.getElementById('recipe-heading');
  const badgeCuisine = document.getElementById('badge-cuisine');
  const badgeDiet = document.getElementById('badge-diet');
  const recipeIngredientsChecklist = document.getElementById('recipe-ingredients-checklist');
  const recipeStepsOrdered = document.getElementById('recipe-steps-ordered');
  const recipeQuote = document.getElementById('recipe-quote');

  const btnCopyRecipe = document.getElementById('btn-copy-recipe');
  const btnPrintRecipe = document.getElementById('btn-print-recipe');

  let currentRawRecipe = '';
  let recipeQuoteInterval = null;

  const cookingQuotes = [
    'Consulting flavor pairing databases...',
    'Balancing savory aromatics and spices...',
    'Simmering step-by-step culinary instructions...',
    'Plating your personalized signature dish...'
  ];

  // Quick Chips
  recipeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-val');
      const cur = recipeIngredients.value.trim();
      if (!cur) {
        recipeIngredients.value = val;
      } else {
        const items = cur.split(',').map(s => s.trim().toLowerCase());
        if (!items.includes(val.toLowerCase())) {
          recipeIngredients.value = `${cur}, ${val}`;
        }
      }
      recipeIngredients.removeAttribute('aria-invalid');
      recipeIngredients.focus();
    });
  });

  btnClearIngredients.addEventListener('click', () => {
    recipeIngredients.value = '';
    recipeIngredients.removeAttribute('aria-invalid');
    recipeIngredients.focus();
  });

  // Modern Web Guidance: Validation Sync
  const syncAria = (el) => {
    if (!el.checkValidity()) {
      el.setAttribute('aria-invalid', 'true');
    } else {
      el.removeAttribute('aria-invalid');
    }
  };
  recipeIngredients.addEventListener('blur', () => syncAria(recipeIngredients));
  recipeIngredients.addEventListener('input', () => {
    if (recipeIngredients.checkValidity()) recipeIngredients.removeAttribute('aria-invalid');
  });

  function showRecipeState(st) {
    recipeEmpty.classList.add('hidden');
    recipeLoading.classList.add('hidden');
    recipeError.classList.add('hidden');
    recipeOutput.classList.add('hidden');

    if (recipeQuoteInterval) {
      clearInterval(recipeQuoteInterval);
      recipeQuoteInterval = null;
    }

    if (st === 'loading') {
      recipeLoading.classList.remove('hidden');
      let idx = 0;
      recipeQuote.textContent = cookingQuotes[0];
      recipeQuoteInterval = setInterval(() => {
        idx = (idx + 1) % cookingQuotes.length;
        recipeQuote.textContent = cookingQuotes[idx];
      }, 2200);
    } else if (st === 'error') {
      recipeError.classList.remove('hidden');
    } else if (st === 'output') {
      recipeOutput.classList.remove('hidden');
    } else {
      recipeEmpty.classList.remove('hidden');
    }
  }

  function renderRecipeCard(rawText, cuisine, dietary) {
    currentRawRecipe = rawText;
    let title = 'Chef’s Gourmet Creation';
    const ingredients = [];
    const steps = [];

    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let section = '';

    for (let line of lines) {
      if ((line.startsWith('# ') || line.startsWith('## ') || line.toLowerCase().startsWith('title:')) && title === 'Chef’s Gourmet Creation') {
        title = line.replace(/^#+\s*/, '').replace(/^title:\s*/i, '').replace(/\*\*/g, '').trim();
        continue;
      }
      const lower = line.toLowerCase();
      if (lower.includes('ingredient')) {
        section = 'ingredients';
        continue;
      } else if (lower.includes('instruction') || lower.includes('direction') || lower.includes('step')) {
        section = 'instructions';
        continue;
      }

      if (section === 'ingredients') {
        if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
          ingredients.push(line.replace(/^[-*•]\s*/, '').replace(/\*\*/g, '').trim());
        }
      } else if (section === 'instructions') {
        if (/^\d+\.\s*/.test(line)) {
          steps.push(line.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim());
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          steps.push(line.replace(/^[-*]\s*/, '').replace(/\*\*/g, '').trim());
        } else if (line.length > 15) {
          steps.push(line.replace(/\*\*/g, '').trim());
        }
      }
    }

    if (ingredients.length === 0 && steps.length === 0) {
      title = lines[0] ? lines[0].replace(/^#+\s*/, '') : 'Artisanal Recipe';
      steps.push(...lines.slice(1));
    }

    recipeHeading.textContent = title;
    badgeCuisine.textContent = cuisine !== 'any' ? cuisine : 'Global Fusion';
    badgeDiet.textContent = dietary !== 'none' ? dietary : 'Standard';

    // Auto-fetch image using backend /generate-image endpoint
    const imgPrompt = `${title} gourmet culinary food dish photography, high resolution`;
    recipeImg.src = `/generate-image?prompt=${encodeURIComponent(imgPrompt)}`;
    recipeImg.alt = title;

    // Render Checklist
    recipeIngredientsChecklist.innerHTML = '';
    ingredients.forEach((ing, i) => {
      const li = document.createElement('li');
      li.className = 'check-item';
      li.innerHTML = `
        <input type="checkbox" id="ing-chk-${i}">
        <label for="ing-chk-${i}">${ing}</label>
      `;
      li.querySelector('input').addEventListener('change', (e) => {
        li.classList.toggle('done', e.target.checked);
      });
      recipeIngredientsChecklist.appendChild(li);
    });

    // Render Steps
    recipeStepsOrdered.innerHTML = '';
    steps.forEach((step, i) => {
      const li = document.createElement('li');
      li.className = 'step-item';
      li.innerHTML = `
        <span class="step-number">${i + 1}</span>
        <div class="step-text">${step}</div>
      `;
      recipeStepsOrdered.appendChild(li);
    });

    showRecipeState('output');
  }

  async function handleRecipeSubmit() {
    syncAria(recipeIngredients);
    if (!recipeForm.checkValidity()) {
      recipeIngredients.focus();
      return;
    }

    const ingredients = recipeIngredients.value.trim();
    const cuisine = recipeCuisine.value;
    const dietRadio = document.querySelector('input[name="diet"]:checked');
    const dietary = dietRadio ? dietRadio.value : 'none';

    showRecipeState('loading');

    try {
      const url = `/recipe-creator?ingredients=${encodeURIComponent(ingredients)}&cuisine=${encodeURIComponent(cuisine)}&dietaryRestrictions=${encodeURIComponent(dietary)}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }
      const recipeText = await res.text();
      renderRecipeCard(recipeText, cuisine, dietary);
    } catch (err) {
      console.error(err);
      recipeErrorText.textContent = err.message || 'Could not connect to /recipe-creator endpoint.';
      showRecipeState('error');
    }
  }

  recipeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleRecipeSubmit();
  });
  btnRetryRecipe.addEventListener('click', handleRecipeSubmit);

  btnCopyRecipe.addEventListener('click', async () => {
    if (!currentRawRecipe) return;
    try {
      await navigator.clipboard.writeText(currentRawRecipe);
      showToast('📋 Recipe copied to clipboard!');
    } catch {
      showToast('Could not access clipboard.');
    }
  });

  btnPrintRecipe.addEventListener('click', () => {
    window.print();
  });

  /* =========================================================================
     4. MODULE 2: IMAGE STUDIO (/generate-image)
     ========================================================================= */
  const imageForm = document.getElementById('image-form');
  const imagePromptInput = document.getElementById('image-prompt-input');
  const imgEmpty = document.getElementById('img-empty');
  const imgLoading = document.getElementById('img-loading');
  const imgDisplay = document.getElementById('img-display');
  const generatedVisualImg = document.getElementById('generated-visual-img');
  const btnOpenFullImg = document.getElementById('btn-open-full-img');
  const btnCopyImgUrl = document.getElementById('btn-copy-img-url');
  const promptChips = document.querySelectorAll('.chip-img-prompt');

  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      imagePromptInput.value = chip.getAttribute('data-p');
      imagePromptInput.focus();
    });
  });

  imagePromptInput.addEventListener('blur', () => syncAria(imagePromptInput));
  imagePromptInput.addEventListener('input', () => {
    if (imagePromptInput.checkValidity()) imagePromptInput.removeAttribute('aria-invalid');
  });

  imageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    syncAria(imagePromptInput);
    if (!imageForm.checkValidity()) {
      imagePromptInput.focus();
      return;
    }

    const prompt = imagePromptInput.value.trim();
    const endpointUrl = `/generate-image?prompt=${encodeURIComponent(prompt)}`;

    imgEmpty.classList.add('hidden');
    imgDisplay.classList.add('hidden');
    imgLoading.classList.remove('hidden');

    // Create a new image element to preload
    const preloader = new Image();
    preloader.onload = () => {
      generatedVisualImg.src = endpointUrl;
      btnOpenFullImg.href = endpointUrl;
      imgLoading.classList.add('hidden');
      imgDisplay.classList.remove('hidden');
    };
    preloader.onerror = () => {
      imgLoading.classList.add('hidden');
      imgDisplay.classList.remove('hidden');
      generatedVisualImg.src = endpointUrl;
      btnOpenFullImg.href = endpointUrl;
    };
    preloader.src = endpointUrl;
  });

  btnCopyImgUrl.addEventListener('click', async () => {
    const url = generatedVisualImg.src;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      showToast('🔗 Image link copied to clipboard!');
    } catch {
      showToast('Could not copy link.');
    }
  });

  /* =========================================================================
     5. MODULE 3: AI CHAT ASSISTANT (/ask-ai & /ask-ai-options)
     ========================================================================= */
  const chatHubForm = document.getElementById('chat-hub-form');
  const chatHubInput = document.getElementById('chat-hub-input');
  const chatHubStream = document.getElementById('chat-hub-stream');
  const btnClearChat = document.getElementById('btn-clear-chat');
  const chatQuickPills = document.querySelectorAll('.quick-chip-chat');

  chatQuickPills.forEach(pill => {
    pill.addEventListener('click', () => {
      chatHubInput.value = pill.getAttribute('data-text');
      chatHubInput.focus();
    });
  });

  btnClearChat.addEventListener('click', () => {
    chatHubStream.innerHTML = `
      <div class="chat-bubble bot">
        Conversation cleared. How can I assist you today?
      </div>
    `;
  });

  async function sendChatMessage() {
    const text = chatHubInput.value.trim();
    if (!text) return;
    chatHubInput.value = '';

    // Append user message
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.textContent = text;
    chatHubStream.appendChild(userBubble);

    // Append loading bot message
    const botBubble = document.createElement('div');
    botBubble.className = 'chat-bubble bot';
    botBubble.textContent = 'Thinking...';
    chatHubStream.appendChild(botBubble);
    chatHubStream.scrollTop = chatHubStream.scrollHeight;

    // Detect endpoint mode
    const mode = document.querySelector('input[name="chatEndpoint"]:checked').value;
    const endpoint = mode === 'options' ? '/ask-ai-options' : '/ask-ai';

    try {
      const res = await fetch(`${endpoint}?prompt=${encodeURIComponent(text)}`);
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }
      const reply = await res.text();
      botBubble.textContent = reply;
    } catch (err) {
      botBubble.textContent = `Error connecting to ${endpoint}: ${err.message}`;
    }

    chatHubStream.scrollTop = chatHubStream.scrollHeight;
  }

  chatHubForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendChatMessage();
  });
});
