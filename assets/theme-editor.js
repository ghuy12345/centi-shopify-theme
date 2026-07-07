function hideProductModal() {
  const productModal = document.querySelectorAll('product-modal[open]');
  productModal && productModal.forEach((modal) => modal.hide());
}

document.addEventListener('shopify:block:select', function (event) {
  hideProductModal();
  const blockSelectedIsSlide = event.target.classList.contains('slideshow__slide');
  if (!blockSelectedIsSlide) return;

  const parentSlideshowComponent = event.target.closest('slideshow-component');
  parentSlideshowComponent.pause();

  setTimeout(function () {
    parentSlideshowComponent.slider.scrollTo({
      left: event.target.offsetLeft,
    });
  }, 200);
});

document.addEventListener('shopify:block:deselect', function (event) {
  const blockDeselectedIsSlide = event.target.classList.contains('slideshow__slide');
  if (!blockDeselectedIsSlide) return;
  const parentSlideshowComponent = event.target.closest('slideshow-component');
  if (parentSlideshowComponent.autoplayButtonIsSetToPlay) parentSlideshowComponent.play();
});

document.addEventListener('shopify:section:load', () => {
  hideProductModal();
  const zoomOnHoverScript = document.querySelector('[id^=EnableZoomOnHover]');
  if (!zoomOnHoverScript) return;
  if (zoomOnHoverScript) {
    const newScriptTag = document.createElement('script');
    newScriptTag.src = zoomOnHoverScript.src;
    zoomOnHoverScript.parentNode.replaceChild(newScriptTag, zoomOnHoverScript);
  }
});

document.addEventListener('shopify:section:reorder', () => hideProductModal());

document.addEventListener('shopify:section:select', () => hideProductModal());

document.addEventListener('shopify:section:deselect', () => hideProductModal());

document.addEventListener('shopify:inspector:activate', () => hideProductModal());

document.addEventListener('shopify:inspector:deactivate', () => hideProductModal());


<script>
document.addEventListener('DOMContentLoaded', () => {
  const TERMS_SELECTOR = 'shopify-payment-terms';
  const BUTTON_SELECTOR = '.shopify-payment-button';
  const CUSTOM_CLASS = 'custom-shop-pay-terms';

  let initInterval = null;
  let variantCheckInterval = null;
  let lastKnownText = '';

  // Helper: Extract clean text from the Shadow DOM
  function getShadowText() {
    const terms = document.querySelector(TERMS_SELECTOR);
    if (!terms || !terms.shadowRoot) return null;
    
    const contentSpan = terms.shadowRoot.querySelector('#shopify-installments-content');
    if (!contentSpan) return null;

    // Clone to avoid mutating the actual shadow DOM
    const cloned = contentSpan.cloneNode(true);
    const logoContainer = cloned.querySelector('div'); // The div wrapping the SVG
    if (logoContainer) logoContainer.remove();

    // Clean up text
    return cloned.textContent.trim().replace(/\s*with\s*$/i, '').trim();
  }

  // Helper: Create or update the custom UI
  function updateCustomUI(text) {
    let container = document.querySelector('.' + CUSTOM_CLASS);
    
    // Create container if it doesn't exist
    if (!container) {
      const btn = document.querySelector(BUTTON_SELECTOR);
      if (!btn) return;
      
      container = document.createElement('div');
      container.className = CUSTOM_CLASS;

      // Create the "View sample plans" button
      const newBtn = document.createElement('button');
      newBtn.textContent = 'View sample plans';
      newBtn.className = 'custom-shop-pay-cta';
      
      // Click handler dynamically finds the original CTA to open the modal
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const originalCta = document.querySelector(TERMS_SELECTOR)?.shadowRoot?.querySelector('#shopify-installments-cta');
        if (originalCta) originalCta.click();
      });

      container.appendChild(document.createTextNode('')); // Placeholder for text node
      container.appendChild(newBtn);
      
      // Insert below the Shop Pay button
      btn.parentNode.insertBefore(container, btn.nextSibling);
    }

    // Update the text node (first child)
    if (container.firstChild && container.firstChild.nodeType === Node.TEXT_NODE) {
      container.firstChild.nodeValue = text + ' ';
    }
    
    lastKnownText = text;
  }

  // 1. Initialization Polling (Runs until elements are found)
  function init() {
    const terms = document.querySelector(TERMS_SELECTOR);
    const btn = document.querySelector(BUTTON_SELECTOR);

    if (terms && btn && terms.shadowRoot) {
      const text = getShadowText();
      if (text) {
        updateCustomUI(text);
        terms.style.display = 'none'; // Hide original Shopify element

        // Stop initialization polling
        if (initInterval) {
          clearInterval(initInterval);
          initInterval = null;
        }

        // Start variant checking
        startVariantCheck();
      }
    }
  }

  // 2. Variant Change Polling (Runs slowly to check for price updates)
  function startVariantCheck() {
    if (variantCheckInterval) return; // Prevent duplicate intervals

    variantCheckInterval = setInterval(() => {
      const terms = document.querySelector(TERMS_SELECTOR);
      if (!terms) return;

      // Ensure original stays hidden
      if (terms.style.display !== 'none') {
        terms.style.display = 'none';
      }

      // Only update DOM if the text actually changed (prevents freezing)
      const currentText = getShadowText();
      if (currentText && currentText !== lastKnownText) {
        updateCustomUI(currentText);
      }
    }, 500); // Check twice a second (very lightweight)
  }

  // Kick off initialization
  init();
  initInterval = setInterval(init, 300); 

  // Cleanup intervals when leaving the page (Good practice)
  window.addEventListener('beforeunload', () => {
    if (initInterval) clearInterval(initInterval);
    if (variantCheckInterval) clearInterval(variantCheckInterval);
  });
});
</script>