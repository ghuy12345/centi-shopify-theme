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


document.addEventListener("DOMContentLoaded", function () {

    function updateShopPay() {

        const terms = document.querySelector("shopify-payment-terms");

        if (!terms || !terms.shadowRoot) return;

        const shadow = terms.shadowRoot;

        const content = shadow.querySelector("#shopify-installments-content");
        const learnMore = shadow.querySelector("#shopify-installments-cta");

        if (!content) return;

        // Hide Learn More
        if (learnMore) {
            learnMore.style.display = "none";
        }

        // First text node -> "Pay in 3 interest-free instalments of "
        if (content.childNodes[0] && content.childNodes[0].nodeType === 3) {
            content.childNodes[0].textContent = "";
        }

        // Third text node -> " with "
        if (content.childNodes[2] && content.childNodes[2].nodeType === 3) {
            content.childNodes[2].textContent = " with ";
        }

    }

    updateShopPay();

    setInterval(updateShopPay, 500);

});
