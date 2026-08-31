export function playNotificationAlert() {
  if (typeof window === "undefined") return;

  try {
    // Attempt to vibrate if supported (works on Android, ignored on iOS Safari)
    if ("vibrate" in navigator) {
      // Short double vibration (100ms on, 50ms off, 100ms on)
      navigator.vibrate([100, 50, 100]);
    }

    // Attempt to play a subtle "ding" sound using Web Audio API
    // This avoids needing an external MP3 file and plays instantly
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    // Start at C5, slide up to C6 quickly for a pleasant "pop" / "ding"
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1);

    // Very soft volume (0.1) fading out quickly to avoid being annoying
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (err) {
    // Browsers block autoplay if the user hasn't interacted with the document yet.
    // We swallow this error silently.
    console.debug("Notification audio/vibration prevented by browser", err);
  }
}
