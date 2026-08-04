"use strict";

const state = {
  config: null,
  lang: "de",
  idle: false,
  timer: null,
  playerIdleTimer: null,
  idleOverlayReturnTimer: null,
  countdownTimer: null,
  countdownValue: 3,
  queue: [],
  index: 0,
  current: null,
  titleTimer: null,
  titleVisibleLayer: 0
};

const $ = id => document.getElementById(id);
const els = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();

  try {
    state.config = window.KIOSK_CONFIG;

    if (
      !state.config ||
      !Array.isArray(state.config.videos) ||
      state.config.videos.length === 0
    ) {
      throw new Error("Keine Videos in config.js gefunden.");
    }

    document.title = "733:02:35 Videokiosk";

    bindEvents();
    renderGallery();
    showScreen("gallery");
    startGalleryTitleAlternation();
  } catch (error) {
    console.error(error);
    els.fatalText.textContent =
      "config.js konnte nicht geladen werden oder enthält einen Fehler.";
    showScreen("fatal");
  }
  resetIdle()
}

function cacheElements() {
  Object.assign(els, {
    gallery: $("gallery"),
    galleryTitle: $("gallery-title"),
    gallerySubtitle: $("gallery-subtitle"),

    fatal: $("fatal"),
    fatalText: $("fatal-text"),
    grid: $("grid"),

    player: $("player"),
    videoWrap: document.querySelector(".video-wrap"),
    playerScreen: $("player-screen"),
    playerTitle: $("player-title"),
    playerSubtitle: $("player-subtitle"),
    idleOverlay: $("idle-overlay"),
    idleCountdownOverlay: $("idle-countdown-overlay"),
    idleCountdownLabel: $("idle-countdown-label"),
    idleCountdownText: $("idle-countdown-text"),
    error: $("error")
  });
}

function bindEvents() {

  els.player.addEventListener("ended", () => {
    if (state.idle) {
      playNextIdle();
    } else {
      showGallery();
    }
  });

  els.player.addEventListener("error", () => {
    showError();

    if (state.idle) {
      window.setTimeout(playNextIdle, 1500);
    }
  });

  els.idleOverlay.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    /*
     * Erster Tipp:
     * Text in die Mitte bewegen und Zeitfenster starten.
     */
    if (!els.idleOverlay.classList.contains("is-centered")) {
      startIdleOverlayConfirmation();
      return;
    }

    /*
     * Zweiter Tipp innerhalb des Zeitfensters:
     * Timer beenden und zur Galerie zurückkehren.
     */
    clearIdleOverlayReturnTimer();
    exitIdle();
  });

  // Verhindert, dass das pointerdown-Ereignis
  // die Aktivitätslogik des Dokuments erreicht.
  els.idleCountdownOverlay.addEventListener("pointerdown", event => {
    event.stopPropagation();
  });

  // Erst den vollständigen Klick abfangen.
  // Das Overlay wird danach ausgeblendet.
  els.idleCountdownOverlay.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    // Erst nach vollständiger Verarbeitung des Klicks ausblenden.
    window.setTimeout(resetIdle, 0);
  });

  els.videoWrap.addEventListener("click", event => {
    // Im Idle-Modus verarbeitet das sichtbare Overlay den Klick.
    if (state.idle) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Wartet nicht länger auf den Timeout.
    enterIdleDuringPlayback();
  });

  document.addEventListener("pointerdown", handleActivity, { passive: true });
  document.addEventListener("keydown", handleActivity);
  document.addEventListener("contextmenu", event => event.preventDefault());
  document.addEventListener("dragstart", event => event.preventDefault());

  document.addEventListener("pointerdown", handleActivity, { passive: true });
  document.addEventListener("pointermove", handleActivity, { passive: true });
  window.addEventListener("scroll", handleActivity, { passive: true });
  document.addEventListener("wheel", handleActivity, { passive: true });
  document.addEventListener("keydown", handleActivity);
}

function renderGallery() {

  els.grid.innerHTML = "";

  state.config.videos.forEach(video => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";

    card.innerHTML = `
      <img src="${video.thumbnail || "thumbnails/placeholder.svg"}" alt="">
      <div class="card-body">
        <h2>${localized(video.title)}</h2>
        <p>${video.meta ? localized(video.meta) : t.playVideo}</p>
      </div>
    `;

    card.addEventListener("click", () => play(video, false));
    els.grid.appendChild(card);
  });

}

function play(video, idleMode = false) {
  state.current = video;
  state.idle = idleMode;

  loadVideo(video, {
    idleMode
  });
}

function reloadCurrentVideo(options = {}) {
  if (!state.current) {
    return;
  }

  loadVideo(state.current, {
    idleMode: state.idle,
  });
}

function loadVideo(video, options = {}) {
  const {
    idleMode = false
  } = options;

  clearIdle();
  clearPlayerIdleTimer();
  stopTitleAlternation();

  els.player.pause();
  els.player.removeAttribute("src");
  els.player.innerHTML = "";
  els.player.load();

  els.player.src = source(video);

  const sub = subtitle(video);
  if (sub) {
    const track = document.createElement("track");
    track.kind = "subtitles";
    track.srclang = state.lang;
    track.label = state.lang === "en" ? "English" : "Deutsch";
    track.src = sub;
    track.default = true;
    els.player.appendChild(track);
  }

  const videoSrc = source(video)?.trim();

  console.log("Zu ladende Datei:", {
    videoSrc,
  });

  startPlayerTitleAlternation(video);

  els.playerSubtitle.textContent = localized(video.meta);
  els.player.controls = !idleMode;

  resetIdleOverlayPosition();
  els.idleOverlay.classList.toggle("hidden", !idleMode);
  els.error.classList.add("hidden");

  showScreen("player");

  // Ein manuell ausgewähltes Video wechselt nach
  // idleTimeoutSeconds in den Idle-Zustand,
  // läuft dabei aber unverändert weiter.
  if (!idleMode) {
    schedulePlayerIdle();
  }

  els.player.play().catch(playError => {
    console.error("Video konnte nicht automatisch gestartet werden:", playError);
    // Prüfen, ob es sich um die Autoplay-Sperre handelt
    if (playError.name === "NotAllowedError") {
      showError(
        "Autoplay gesperrt (autoplay-policy). Bitte starte die Anwendung über die Batch-Datei."
      );
    } else {
      showError(
        `Das Video konnte nicht gestartet werden: ${playError?.message || playError?.name}`
      );
    }
  });
}

function showGallery() {
  stopTitleAlternation();
  state.idle = false;

  els.player.controls = true;
  resetIdleOverlayPosition();
  els.idleOverlay.classList.add("hidden");

  renderGallery();
  showScreen("gallery");
  startGalleryTitleAlternation();
  resetIdle();
}

function startIdle() {
  stopIdleCountdown();

  state.lang = state.config.idleLanguage || "de";
  state.queue = shuffle([...state.config.videos]);
  state.index = 0;

  playNextIdle();
}

function playNextIdle() {
  if (state.queue.length === 0 || state.index >= state.queue.length) {
    state.queue = shuffle([...state.config.videos]);
    state.index = 0;
  }

  const video = state.queue[state.index];
  state.index += 1;
  play(video, true);
}

function exitIdle() {
  stop();
  state.idle = false;
  state.lang = state.lang || "de";

  renderGallery();
  showGallery();
}

function handleActivity() {
  if (!state.config || state.idle) {
    return;
  }

  if (!els.gallery.classList.contains("hidden")) {
    resetIdle();
  }
}

function getIdleTimeoutMilliseconds() {
  const seconds = Number(state.config.idleTimeoutSecondsPlayer || 60);
  return seconds * 1000;
}

function schedulePlayerIdle() {
  clearPlayerIdleTimer();

  state.playerIdleTimer = window.setTimeout(() => {
    state.playerIdleTimer = null;
    enterIdleDuringPlayback();
  }, getIdleTimeoutMilliseconds());
}

function enterIdleDuringPlayback() {
  if (
    state.idle ||
    !state.current ||
    els.playerScreen.classList.contains("hidden")
  ) {
    return;
  }

  // Der Player befindet sich ab jetzt im echten Idle-Modus.
  state.idle = true;
  state.lang = state.config.idleLanguage || "de";

  // Idle-Warteschlange für das nächste Video vorbereiten.
  let videos = [...state.config.videos];

  // Das aktuell laufende Video beim unmittelbar nächsten
  // Zufallsvideo möglichst ausschließen.
  if (videos.length > 1) {
    videos = videos.filter(video => video !== state.current);
  }

  state.queue = shuffle(videos);
  state.index = 0;

  // Nur die Oberfläche umschalten.
  // Das aktuelle Video läuft unverändert weiter.
  els.player.controls = false;
  resetIdleOverlayPosition();
  els.idleOverlay.classList.remove("hidden");
}

function clearPlayerIdleTimer() {
  if (state.playerIdleTimer) {
    clearTimeout(state.playerIdleTimer);
    state.playerIdleTimer = null;
  }
}

function startIdleOverlayConfirmation() {
  clearIdleOverlayReturnTimer();

  els.idleOverlay.classList.add("is-centered");

  const seconds = Number(
    state.config.idleOverlayConfirmSeconds || 5
  );

  state.idleOverlayReturnTimer = window.setTimeout(() => {
    state.idleOverlayReturnTimer = null;

    // Der Text fährt durch die CSS-Transition wieder zurück.
    els.idleOverlay.classList.remove("is-centered");
  }, seconds * 1000);
}

function clearIdleOverlayReturnTimer() {
  if (state.idleOverlayReturnTimer) {
    clearTimeout(state.idleOverlayReturnTimer);
    state.idleOverlayReturnTimer = null;
  }
}

function resetIdleOverlayPosition() {
  clearIdleOverlayReturnTimer();
  els.idleOverlay.classList.remove("is-centered");
}

function resetIdle() {
  clearIdle();
  stopIdleCountdown();

  if (els.gallery.classList.contains("hidden")) {
    return;
  }

  const seconds = Number(state.config.idleTimeoutSeconds || 60);
  state.timer = window.setTimeout(startIdleCountdown, seconds * 1000);
}

function clearIdle() {
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}

function stop() {
  clearIdle();
  stopTitleAlternation();

  els.player.pause();
  els.player.removeAttribute("src");
  els.player.innerHTML = "";
  els.player.load();

  state.current = null;
}

function showScreen(name) {
  // Eine zentrale Funktion übernimmt die Sichtbarkeit aller Screens.
  const screens = {
    gallery: els.gallery,
    player: els.playerScreen,
    fatal: els.fatal
  };

  Object.entries(screens).forEach(([screenName, element]) => {
    element.classList.toggle("hidden", screenName !== name);
  });

  window.scrollTo(0, 0);
}

function localized(value) {
  if (typeof value === "string") {
    return value;
  }

  return value?.[state.lang] || value?.de || value?.en || "";
}

function source(video) {
  return video.files?.[state.lang] || video.files?.de || video.files?.en || "";
}

function subtitle(video) {
  return video.subtitles?.[state.lang] || "";
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function showError(message = "Video konnte nicht geladen werden. Pfad in config.js prüfen.") {
  els.error.textContent = message;
  els.error.classList.remove("hidden");
}

function startIdleCountdown() {
  clearIdle();

  if (els.gallery.classList.contains("hidden")) {
    return;
  }

  state.countdownValue = Number(state.config.idleCountdownSeconds || 3);
  els.idleCountdownText.textContent = state.countdownValue;
  els.idleCountdownOverlay.classList.remove("hidden");

  state.countdownTimer = window.setInterval(() => {
    state.countdownValue -= 1;

    if (state.countdownValue <= 0) {
      stopIdleCountdown();
      startIdle();
      return;
    }

    els.idleCountdownText.textContent = state.countdownValue;
  }, 1000);
}

function stopIdleCountdown() {
  if (state.countdownTimer) {
    clearInterval(state.countdownTimer);
    state.countdownTimer = null;
  }

  els.idleCountdownOverlay.classList.add("hidden");
}

function startTitleAlternation(element, germanText, englishText) {
  stopTitleAlternation();

  const de = germanText || englishText || "";
  const en = englishText || germanText || "";

  element.innerHTML = `
    <span class="title-layer is-visible" lang="de"></span>
    <span class="title-layer" lang="en"></span>
  `;

  const layers = element.querySelectorAll(".title-layer");

  layers[0].textContent = de;
  layers[1].textContent = en;

  state.titleVisibleLayer = 0;

  // Kein Wechsel, wenn nur ein Text existiert
  // oder beide Sprachversionen identisch sind.
  if (!de || !en || de.trim() === en.trim()) {
    return;
  }

  state.titleTimer = window.setInterval(() => {
    const currentLayer = state.titleVisibleLayer;
    const nextLayer = currentLayer === 0 ? 1 : 0;

    layers[currentLayer].classList.remove("is-visible");
    layers[nextLayer].classList.add("is-visible");

    state.titleVisibleLayer = nextLayer;
  }, 5000);
}

function startGalleryTitleAlternation() {
  const title = state.config.galleryTitle || {
    de: "Zeugnisse von Augenzeugen und Überlebenden",
    en: "Eyewitness and Survivor Testimonies"
  };

  startTitleAlternation(
    els.galleryTitle,
    title.de,
    title.en
  );
}

function startPlayerTitleAlternation(video) {
  const germanTitle =
    typeof video.title === "string"
      ? video.title
      : video.title?.de || video.title?.en || "";

  const englishTitle =
    typeof video.title === "string"
      ? video.title
      : video.title?.en || video.title?.de || "";

  startTitleAlternation(
    els.playerTitle,
    germanTitle,
    englishTitle
  );
}

function stopTitleAlternation() {
  if (state.titleTimer) {
    clearInterval(state.titleTimer);
    state.titleTimer = null;
  }

  state.titleVisibleLayer = 0;
}