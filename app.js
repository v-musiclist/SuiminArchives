 // ===== Mobile tabs (hamburger) =====
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

  // メニュー内のリンクを押したら閉じる(hashchange前に閉じる)
  navPanel?.addEventListener("click", (e) => {
    const a = e.target?.closest?.("a");
    if (a) closeNav();
  });

  // 画面サイズがPCに戻ったら閉じる(バグり防止)
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 769px)").matches) closeNav();
  });

  const liveList = document.getElementById("liveList");

  const getLiveIdNumber = (liveId) => {
    const match = String(liveId).match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  };

  const renderLives = async () => {
    if (!liveList) return;

    try {
      const response = await fetch("./data/download_live_file.json");
      if (!response.ok) throw new Error("ライブ情報を読み込めませんでした");

      const lives = await response.json();
      const sortedLives = [...lives].sort((a, b) => getLiveIdNumber(b.live_id) - getLiveIdNumber(a.live_id));

      liveList.innerHTML = sortedLives.map((live) => `
        <article class="live-card">
          <div class="live-card__meta">
            <div class="live-card__id">${live.live_id}</div>
            <div class="live-card__setting">${live.live_setting}</div>
          </div>
          <img class="live-card__image" src="${live.live_image}" alt="${live.live_id}" data-url="${live.url}" loading="lazy" />
        </article>
      `).join("");
    } catch (error) {
      liveList.innerHTML = `<p class="live-card__empty">${error.message}</p>`;
    }
  };

  liveList?.addEventListener("click", (event) => {
    const target = event.target.closest(".live-card__image");
    if (!target) return;

    const url = target.getAttribute("data-url");
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  });

  renderLives();
