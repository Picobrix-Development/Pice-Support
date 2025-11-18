<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let safeAreaDebug = '';
  let dynamicPadding = {
    top: '16px',
    right: '16px',
    bottom: '16px',
    left: '16px'
  };

  // Detect Safe Area for both iOS and Android
  onMount(() => {
    if (!browser) return;

    // Function to detect and apply safe area
    function detectSafeArea() {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      // Check CSS env() support (iOS)
      const topInset = computedStyle.getPropertyValue('--safe-area-inset-top');
      const bottomInset = computedStyle.getPropertyValue('--safe-area-inset-bottom');
      const leftInset = computedStyle.getPropertyValue('--safe-area-inset-left');
      const rightInset = computedStyle.getPropertyValue('--safe-area-inset-right');

      // Check if CSS env() is working
      const hasEnvSupport = CSS.supports('padding-top: env(safe-area-inset-top)');

      // Android/Unity WebView detection
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isUnityWebView = /UnityWebView/i.test(navigator.userAgent);

      // Detect viewport height difference (indicates status bar/navigation bar)
      const viewportHeight = window.innerHeight;
      const screenHeight = window.screen.height;
      const heightDiff = screenHeight - viewportHeight;

      // Detect if we're in standalone/fullscreen mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           window.navigator.standalone === true;

      let detectedTop = 16;
      let detectedBottom = 16;
      let detectedLeft = 16;
      let detectedRight = 16;

      // iOS: Use CSS env() if available
      if (hasEnvSupport && topInset && topInset !== '0px') {
        // CSS env() is working, values already applied via CSS variables
        safeAreaDebug = `iOS env() detected: ${topInset} / ${bottomInset}`;
        return; // CSS variables handle this
      }

      // Android/Unity: Manual detection
      if (isAndroid || isUnityWebView) {
        // Estimate status bar height (typically 24-48px on Android)
        if (heightDiff > 50) {
          detectedTop = Math.max(24, Math.min(48, heightDiff / 2));
        }

        // Add bottom padding for gesture navigation (Android 10+)
        const hasGestureNav = viewportHeight < screenHeight * 0.95;
        if (hasGestureNav) {
          detectedBottom = 24; // Space for gesture bar
        }

        // Apply detected values
        dynamicPadding = {
          top: `${detectedTop}px`,
          right: `${detectedRight}px`,
          bottom: `${detectedBottom}px`,
          left: `${detectedLeft}px`
        };

        safeAreaDebug = `Android detected: top=${detectedTop}px, bottom=${detectedBottom}px, diff=${heightDiff}px`;
      } else {
        // Desktop or unknown device - use minimum padding
        safeAreaDebug = `Desktop: using minimum padding`;
      }

      console.log('🔒 Safe Area Detection:', {
        hasEnvSupport,
        isAndroid,
        isUnityWebView,
        isStandalone,
        viewportHeight,
        screenHeight,
        heightDiff,
        padding: dynamicPadding,
        userAgent: navigator.userAgent
      });
    }

    // Detect on mount
    detectSafeArea();

    // Re-detect on resize (orientation change, keyboard open/close)
    window.addEventListener('resize', detectSafeArea);
    window.addEventListener('orientationchange', detectSafeArea);

    return () => {
      window.removeEventListener('resize', detectSafeArea);
      window.removeEventListener('orientationchange', detectSafeArea);
    };
  });
</script>

<!-- Simple layout for public support pages - no authentication, no sidebar -->
<!-- Apply safe area padding to main container -->
<div
  class="min-h-screen"
  style="
    background-color: #f5f5f7;
    padding-top: max(var(--safe-padding-top), {dynamicPadding.top});
    padding-right: max(var(--safe-padding-right), {dynamicPadding.right});
    padding-bottom: max(var(--safe-padding-bottom), {dynamicPadding.bottom});
    padding-left: max(var(--safe-padding-left), {dynamicPadding.left});
  "
>
  <slot />
</div>

{#if safeAreaDebug && browser}
  <!-- Debug indicator: Shows safe area detection info -->
  <div style="
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 10px;
    z-index: 9999;
    pointer-events: none;
    max-width: 250px;
    line-height: 1.4;
  ">
    {safeAreaDebug}
  </div>
{/if}
