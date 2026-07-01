(() => {
  // config.json から設定を読み込んで設定
  const loadConfig = async () => {
    try {
      const response = await fetch('./data/config.json');
      const config = await response.json();
      if (config && config[0]) {
        const cfg = config[0];

        // ページタイトルを設定
        if (cfg.title) {
          const pageTitle = document.getElementById('pageTitle');
          if (pageTitle) {
            pageTitle.textContent = cfg.title;
            document.title = cfg.title;
          }
        }

        // ブランドタイトルを設定
        if (cfg.brand_title) {
          const siteTitle = document.getElementById('siteTitle');
          if (siteTitle) {
            siteTitle.textContent = cfg.brand_title;
          }
        }

        // ブランドサブタイトルを設定
        if (cfg.brand_subtitle) {
          const siteSub = document.getElementById('siteSub');
          if (siteSub) {
            siteSub.textContent = cfg.brand_subtitle;
          }
        }

        // SNSリンクを設定
        if (cfg.twitter_url) {
          document.querySelectorAll('.twitterBtn').forEach((el) => {
            el.href = cfg.twitter_url;
          });
        }

        if (cfg.youtube_url) {
          document.querySelectorAll('.youtubeBtn').forEach((el) => {
            el.href = cfg.youtube_url;
          });
        }

        if (cfg.other_url) {
          document.querySelectorAll('.otherBtn').forEach((el) => {
            el.href = cfg.other_url;
          });
        }

        // ライブ情報更新日を設定
        if (cfg.date) {
          const liveUpdateNote = document.getElementById('liveUpdateNote');
          if (liveUpdateNote) {
            liveUpdateNote.textContent = `${cfg.date} 更新`;
          }
        }
      }
    } catch (error) {
      console.warn('config.json の読み込みに失敗しました', error);
    }
  };

  loadConfig();

  const navToggle = document.getElementById("navToggle");
  const navPanel = document.getElementById("navPanel");
  const navBackdrop = document.getElementById("navBackdrop");

  const closeNav = () => {
    if (!navPanel) return;
    navPanel.classList.remove("open");
    navPanel.setAttribute("aria-hidden", "true");
    navToggle?.setAttribute("aria-expanded", "false");
  };

  const openNav = () => {
    if (!navPanel) return;
    navPanel.classList.add("open");
    navPanel.setAttribute("aria-hidden", "false");
    navToggle?.setAttribute("aria-expanded", "true");
  };

  navToggle?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!navPanel) return;
    navPanel.classList.contains("open") ? closeNav() : openNav();
  });

  navBackdrop?.addEventListener("click", closeNav);

  navPanel?.addEventListener("click", (e) => {
    const tabBtn = e.target?.closest?.(".tab");
    if (tabBtn) {
      closeNav();
      tabBtn.click();
    }
  });

  // タブ切り替え機能
  const tabs = document.querySelectorAll(".tab");
  const pages = document.querySelectorAll(".page");

  const setActivePage = (tabName) => {
    // すべてのタブとページから active クラスを削除
    tabs.forEach((tab) => tab.classList.remove("active"));
    pages.forEach((page) => page.classList.remove("active"));

    // アクティブなタブとページに active クラスを追加
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add("active");
    document.querySelector(`[data-page="${tabName}"]`)?.classList.add("active");
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.getAttribute("data-tab");
      setActivePage(tabName);
    });
  });

  navPanel?.addEventListener("click", (e) => {
    const a = e.target?.closest?.("a");
    if (a) closeNav();
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 769px)").matches) closeNav();
  });

  const liveList = document.getElementById("liveList");
  const subpanel = document.getElementById("liveSubpanel");
  const subpanelPanel = subpanel?.querySelector(".live-subpanel__panel");
  const subpanelBackdrop = document.getElementById("liveSubpanelBackdrop");
  const subpanelClose = document.getElementById("liveSubpanelClose");
  const subpanelContent = document.getElementById("liveSubpanelContent");
  let sortedLives = [];
  let musicIndex = new Map();

  const getLiveIdNumber = (liveId) => {
    const match = String(liveId).match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  };

  const resetSubpanelScroll = () => {
    if (subpanelPanel) {
      subpanelPanel.scrollTop = 0;
      subpanelPanel.scrollLeft = 0;
    }
    if (subpanelContent) {
      subpanelContent.scrollTop = 0;
    }
  };

  const closeSubpanel = () => {
    if (!subpanel) return;
    resetSubpanelScroll();
    subpanel.classList.remove("open");
    subpanel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const openSubpanel = (live, songs) => {
    if (!subpanel || !subpanelContent) return;
    resetSubpanelScroll();

    const songMarkup = songs.length
      ? `<div class="live-subpanel__songs">${songs.map((song) => `
          <div class="live-subpanel__song">
            <div class="live-subpanel__song-number">${song.song_id || ""}</div>
            <div class="live-subpanel__song-title">${song.title || "曲名未登録"}</div>
            <a class="live-subpanel__song-link" href="${song.url || "#"}" target="_blank" rel="noopener noreferrer" aria-label="${song.title || "曲"} の動画を開く">
              <img src="./assets/youtube.png" alt="YouTube" />
            </a>
          </div>
        `).join("")}</div>`
      : '<p class="live-subpanel__empty">このライブの曲情報はまだありません。</p>';

    subpanelContent.innerHTML = `
      <img class="live-subpanel__hero" src="${live.live_image}" alt="${live.live_id}" />
      <h3 class="live-subpanel__title" id="liveSubpanelTitle">${live.live_id} / ${live.live_setting}</h3>
      <p class="live-subpanel__meta">曲リスト</p>
      ${songMarkup}
    `;

    subpanel.classList.add("open");
    subpanel.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const renderLives = async () => {
    if (!liveList) return;

    try {
      const [liveResponse, musicResponse] = await Promise.all([
        fetch("./data/download_live_file.json"),
        fetch("./data/download_music_file.json")
      ]);

      if (!liveResponse.ok) throw new Error("ライブ情報を読み込めませんでした");
      if (!musicResponse.ok) throw new Error("曲情報を読み込めませんでした");

      const lives = await liveResponse.json();
      const musicData = await musicResponse.json();
      sortedLives = [...lives].sort((a, b) => getLiveIdNumber(b.live_id) - getLiveIdNumber(a.live_id));
      musicIndex = new Map(
        (Array.isArray(musicData) ? musicData : []).map((entry) => [
          entry.live_id,
          Array.isArray(entry.songs) ? entry.songs : []
        ])
      );

      liveList.innerHTML = sortedLives.map((live) => `
        <article class="live-card">
          <div class="live-card__meta">
            <div class="live-card__id">${live.live_id}</div>
            <div class="live-card__setting">${live.live_setting}</div>
          </div>
          <img class="live-card__image" src="${live.live_image}" alt="${live.live_id}" data-live-id="${live.live_id}" loading="lazy" />
        </article>
      `).join("");
    } catch (error) {
      liveList.innerHTML = `<p class="live-card__empty">${error.message}</p>`;
    }
  };

  liveList?.addEventListener("click", (event) => {
    const target = event.target.closest(".live-card__image");
    if (!target) return;

    const liveId = target.getAttribute("data-live-id");
    const live = sortedLives.find((entry) => entry.live_id === liveId);
    if (!live) return;

    const songs = musicIndex.get(liveId) || [];
    openSubpanel(live, songs);
  });

  subpanelBackdrop?.addEventListener("click", closeSubpanel);
  subpanelClose?.addEventListener("click", closeSubpanel);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSubpanel();
  });

  renderLives();
})();