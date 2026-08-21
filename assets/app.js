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

const MEDIA_PATHS = {
  videoDirectory: "videos",
  videoExtension: ".mp4",
  thumbnailExtension: ".png",
  subtitleExtension: ".vtt"
};

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

    subtitleOverlay: $("subtitle-overlay"),
    subtitleDe: $("subtitle-de"),
    subtitleEn: $("subtitle-en"),

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

    // Verhindert mehrere gleichzeitig laufende Fehler-Timeouts.
    clearErrorAdvanceTimer();

    /* Im Fehlerfall nach 1,5 Sekunden zum nächsten Video wechseln.
    * Die Timer-ID wird gespeichert, damit der Wechsel abgebrochen
    * werden kann, falls der Benutzer vorher zur Galerie zurückkehrt.  */
    state.errorAdvanceTimer = window.setTimeout(() => {
      state.errorAdvanceTimer = null;

      /* Zusätzliche Sicherheitsprüfung: Nur weiterschalten, solange Player noch angezeigt wird. */
      if (els.playerScreen.classList.contains("hidden")) {
        return;
      }

      playNextIdle();
    }, 3500);
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
      <img src="${thumbnail(video)}" alt="">
      <div class="card-body">
        <h2>${localized(video.title)}</h2>
        <p>${video.meta ? localized(video.meta) : t.playVideo}</p>
      </div>
    `;

    card.addEventListener("click", () => play(video, false));
    els.grid.appendChild(card);
  });

  renderHomeWatchNotice();
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
  clearSubtitleOverlay();


  els.player.pause();
  els.player.removeAttribute("src");
  els.player.innerHTML = "";
  els.player.load();

  els.player.src = source(video);

  addSubtitleTrack(video, "de");
  addSubtitleTrack(video, "en");

  const videoSrc = source(video)?.trim();

  console.log("Zu ladende Datei:", { videoSrc });

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
    console.error("Video ${videoSrc} konnte nicht automatisch gestartet werden:", playError);
    // Prüfen, ob es sich um die Autoplay-Sperre handelt
    if (playError.name === "NotAllowedError") {
      showError(
        "Autoplay gesperrt (autoplay-policy). Bitte starte die Anwendung über die Batch-Datei."
      );
    } else {
      showError(
        `Das Video ${videoSrc} konnte nicht gestartet werden: "${playError?.message || playError?.name}"`
      );
    }
  });
}

function showGallery() {
  clearSubtitleOverlay();
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
  clearSubtitleOverlay();

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
  const id = String(video.id || "").trim();

  if (!id) {
    return "";
  }

  return getVideoSrc(id);
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

function clearErrorAdvanceTimer() {
  if (state.errorAdvanceTimer !== null) {
    window.clearTimeout(state.errorAdvanceTimer);
    state.errorAdvanceTimer = null;
  }
}

function thumbnail(video) {
  const id = String(video.id || "").trim();
  const thumbnailId = id.replace(/-\d+$/, "");

  return `${MEDIA_PATHS.videoDirectory}/${thumbnailId}${MEDIA_PATHS.thumbnailExtension}`;
}

function subtitle(video, language) {
  const id = String(video.id || "").trim();

  if (!id) {
    return "";
  }

  const lang = language === "en" ? "en" : "de";

  return `${MEDIA_PATHS.videoDirectory}/${id}-${lang}${MEDIA_PATHS.subtitleExtension}`;
}

/**
 * Lädt eine VTT-Untertiteldatei für die angegebene Sprache
 * und verbindet sie mit der benutzerdefinierten Anzeige.
 */
function addSubtitleTrack(video, language) {
  const subtitleSrc = subtitle(video, language);
  console.log("Zu ladende Datei:", { subtitleSrc });

  if (!subtitleSrc) {
    return;
  }

  const trackElement = document.createElement("track");

  trackElement.kind = "subtitles";
  trackElement.srclang = language;
  trackElement.label = language === "en" ? "English" : "Deutsch";
  trackElement.src = subtitleSrc;
  trackElement.default = false;

  els.player.appendChild(trackElement);

  const textTrack = trackElement.track;

  /*
   * hidden bedeutet:
   * Der Browser verarbeitet die Untertitel zeitlich,
   * zeigt sie aber nicht mit seiner eigenen Darstellung an.
   */
  textTrack.mode = "hidden";

  /**
   * Überträgt den aktuell aktiven VTT-Text
   * in die passende eigene Untertitelzeile.
   */
  const updateTrackText = () => {
    const target =
      language === "en"
        ? els.subtitleEn
        : els.subtitleDe;

    target.textContent = getActiveCueText(textTrack);
    updateSubtitleOverlayVisibility();
  };

  textTrack.addEventListener("cuechange", updateTrackText);

  trackElement.addEventListener("load", () => {
    textTrack.mode = "hidden";
    updateTrackText();
  });

  trackElement.addEventListener("error", () => {
    console.error(
      `Untertiteldatei konnte nicht geladen werden: ${subtitleSrc}`
    );

    const target =
      language === "en"
        ? els.subtitleEn
        : els.subtitleDe;

    target.textContent = "";
    updateSubtitleOverlayVisibility();
  });
}

/**
 * Ermittelt den Text aller momentan aktiven Untertitel
 * einer VTT-Textspur.
 */
function getActiveCueText(textTrack) {
  if (!textTrack || !textTrack.activeCues) {
    return "";
  }

  return Array.from(textTrack.activeCues)
    .map(cue => String(cue.text || "").replace(/<[^>]+>/g, ""))
    .join("\n")
    .trim();
}

/**
 * Blendet das Untertitel-Overlay nur ein,
 * wenn mindestens eine Sprache Text enthält.
 */
function updateSubtitleOverlayVisibility() {
  const hasGermanText = els.subtitleDe.textContent.trim() !== "";
  const hasEnglishText = els.subtitleEn.textContent.trim() !== "";

  els.subtitleOverlay.classList.toggle(
    "hidden",
    !hasGermanText && !hasEnglishText
  );
}

/**
 * Entfernt alle aktuell angezeigten Untertitel
 * und blendet das Overlay aus.
 */
function clearSubtitleOverlay() {
  els.subtitleDe.textContent = "";
  els.subtitleEn.textContent = "";
  els.subtitleOverlay.classList.add("hidden");
}



function renderHomeWatchNotice() {

  const homeWatch = state.config.homeWatch;

  if (!homeWatch?.qr || !homeWatch?.text) {
    return;
  }

  const notice = document.createElement("div");
  notice.className = "gallery-home-watch";

  const qr = document.createElement("img");
  qr.className = "gallery-home-watch-qr";
  qr.src = homeWatch.qr;
  qr.alt = "QR-Code";

  const url = document.createElement("p");
  url.className = "gallery-home-watch-url";
  url.textContent = "733ausstellung.de/begleitheft/";

  const text = document.createElement("div");
  text.className = "gallery-home-watch-text";

  const de = document.createElement("p");
  de.lang = "de";
  de.textContent = homeWatch.text.de || "";

  const en = document.createElement("p");
  en.lang = "en";
  en.textContent = homeWatch.text.en || "";

  text.appendChild(de);
  text.appendChild(en);

  notice.appendChild(qr);
  notice.appendChild(url);
  notice.appendChild(text);

  els.grid.appendChild(notice);
}


const isGitHubPages = window.location.hostname.endsWith("github.io");

function getVideoSrc(videoName) {
  if (isGitHubPages) {
    return "preview-videos/preview.mp4";
  }

  return `videos/${videoName}.mp4`;
}