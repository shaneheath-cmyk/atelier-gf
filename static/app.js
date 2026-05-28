/* Atelier GF — Gustav Flemming Digital Art Platform */

// ---------------------------------------------------------------------------
// 30-second audio preview limit
// ---------------------------------------------------------------------------
(function () {
  const PREVIEW_LIMIT = 30; // seconds

  function attachPreviewLimit(audio) {
    if (!audio || audio.dataset.previewBound) return;
    audio.dataset.previewBound = "1";

    const prompt = document.getElementById("subscribe-prompt");

    audio.addEventListener("timeupdate", function () {
      if (audio.currentTime >= PREVIEW_LIMIT) {
        audio.pause();
        audio.currentTime = PREVIEW_LIMIT;
        if (prompt) {
          prompt.classList.remove("hidden");
          prompt.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });

    // Show remaining time
    const timerEl = document.getElementById("preview-timer");
    audio.addEventListener("timeupdate", function () {
      if (!timerEl) return;
      const remaining = Math.max(0, PREVIEW_LIMIT - Math.floor(audio.currentTime));
      timerEl.textContent = remaining > 0 ? `${remaining}s preview remaining` : "Preview ended";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("audio[data-preview]").forEach(attachPreviewLimit);
  });
})();

// ---------------------------------------------------------------------------
// Star rating
// ---------------------------------------------------------------------------
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const stars = document.querySelectorAll(".star-btn");
    if (!stars.length) return;

    stars.forEach(function (star) {
      star.addEventListener("click", function () {
        const value = parseInt(star.dataset.value, 10);
        const artworkId = star.dataset.artwork;

        fetch(`/artwork/${artworkId}/score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: value }),
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            // Update highlighted stars
            stars.forEach(function (s) {
              s.classList.toggle("active", parseInt(s.dataset.value, 10) <= value);
            });
            const avgEl = document.getElementById("avg-score");
            if (avgEl && data.avg) avgEl.textContent = data.avg;
          })
          .catch(function (err) { console.error("Score error:", err); });
      });
    });
  });
})();

// ---------------------------------------------------------------------------
// PayWay Trusted Frame helper
// ---------------------------------------------------------------------------
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("payment-form");
    if (!form) return;

    const publishableKey = form.dataset.publishableKey;
    if (!publishableKey || !window.payway) return;

    payway.createCreditCardFrame({
      publishableApiKey: publishableKey,
      tokenisationResponseHandler: function (status, response) {
        if (status.code !== 200) {
          const errEl = document.getElementById("payway-error");
          if (errEl) errEl.textContent = "Card error: " + (status.message || "Unknown error");
          return;
        }
        const tokenInput = document.getElementById("payway-token");
        if (tokenInput) tokenInput.value = response.singleUseTokenId;
        form.submit();
      },
    }, "payway-frame");
  });
})();

// ---------------------------------------------------------------------------
// Wishlist (localStorage)
// ---------------------------------------------------------------------------
(function () {
  var WL_KEY = 'gf_wishlist';

  function getWishlist() {
    try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]'); } catch { return []; }
  }

  function saveWishlist(list) {
    localStorage.setItem(WL_KEY, JSON.stringify(list));
  }

  window.toggleWishlist = function (e, id) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    var list = getWishlist();
    var idx = list.indexOf(id);
    if (idx === -1) {
      list.push(id);
    } else {
      list.splice(idx, 1);
    }
    saveWishlist(list);
    updateHeartButtons();
  };

  function updateHeartButtons() {
    var list = getWishlist();
    document.querySelectorAll('.wl-heart-btn').forEach(function (btn) {
      var id = parseInt(btn.dataset.id, 10);
      var saved = list.indexOf(id) !== -1;
      btn.textContent = saved ? '♥' : '♡';
      btn.style.color = saved ? 'var(--gold)' : 'var(--gold)';
      btn.style.borderColor = saved ? 'var(--gold-dim)' : 'var(--border)';
      btn.title = saved ? 'Remove from saved' : 'Save to wishlist';
    });
  }

  document.addEventListener('DOMContentLoaded', updateHeartButtons);
})();

// ---------------------------------------------------------------------------
// Email gate: show modal if no email in session
// ---------------------------------------------------------------------------
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("email-gate-modal");
    if (!modal) return;
    // Modal is shown server-side via template flag; JS just handles dismiss
    const dismiss = modal.querySelector(".modal-dismiss");
    if (dismiss) {
      dismiss.addEventListener("click", function () {
        modal.classList.add("hidden");
      });
    }
  });
})();
