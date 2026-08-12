(() => {
  // config.json から設定を読み込んで設定
  let searchSongFlag = false;
  let joySongFlag = false;
  let configLoadPromise = null;
  const IMAGE_FALLBACK_SRC = './assets/nodata.png';

  const makeImageFallbackAttr = () => "onerror=\"this.onerror=null;this.src='" + IMAGE_FALLBACK_SRC + "'\"";
  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
  const isPrivateLive = (live) => String(live?.live_setting || "").trim() === "非公開";
  const getLiveImageSrc = (live) => isPrivateLive(live) ? IMAGE_FALLBACK_SRC : (live.live_image || IMAGE_FALLBACK_SRC);
  const isPrivateVideo = (video) => String(video?.video_option || "").trim() === "非公開";
  const getVideoImageSrc = (video) => isPrivateVideo(video) ? IMAGE_FALLBACK_SRC : (video?.video_image || IMAGE_FALLBACK_SRC);
  const handleImageError = (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement)) return;
    if (!img.src) return;
    if (img.src.includes(IMAGE_FALLBACK_SRC)) return;
    img.onerror = null;
    img.src = IMAGE_FALLBACK_SRC;
  };

  document.addEventListener('error', handleImageError, true);

  const loadConfig = async () => {
    try {
      const response = await fetch('./data/config.json');
      const config = await response.json();
      if (config && config[0]) {
        const cfg = config[0];
        searchSongFlag = cfg.search_song_flg === true;
        joySongFlag = cfg.joy_song_flg === true;

        const accentColor = cfg.accent;
        const accentRgb = cfg.color;
        document.documentElement.style.setProperty('--accent', accentColor);
        document.documentElement.style.setProperty('--accent-rgb', accentRgb);

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

        if (cfg.contact_name) {
          const contactName = document.getElementById('contactUserName');
          if (contactName) {
            contactName.textContent = cfg.contact_name;
          }
        }

        if (cfg.contact_url) {
          const contactButton = document.getElementById('contactButton');
          if (contactButton) {
            contactButton.href = cfg.contact_url;
          }
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

        if (cfg.fanclub_url) {
          document.querySelectorAll('.fanclubBtn').forEach((el) => {
            el.href = cfg.fanclub_url;
          });
        }

        if (cfg.booth_url) {
          document.querySelectorAll('.boothBtn').forEach((el) => {
            el.href = cfg.booth_url;
          });
        }

        if (cfg.sub_url) {
          document.querySelectorAll('.subBtn').forEach((el) => {
            el.href = cfg.sub_url;
          });
        }

        if (cfg.spreads_url) {
          document.querySelectorAll('.spreadsBtn').forEach((el) => {
            el.href = cfg.spreads_url;
          });
        }

        // ホームのおすすめ動画を設定
        const homeFeatured = document.getElementById('homeFeatured');
        if (homeFeatured) {
          homeFeatured.innerHTML = '';

          if (cfg.main_text) {
            const textEl = document.createElement('p');
            textEl.className = 'home-feature__text';
            textEl.textContent = cfg.main_text;
            homeFeatured.appendChild(textEl);
          }

          if (cfg.main_url_id) {
            const videoUrl = `https://www.youtube.com/watch?v=${cfg.main_url_id}`;
            const thumbnailUrl = `https://i.ytimg.com/vi/${cfg.main_url_id}/hq720.jpg`;
            const buttonEl = document.createElement('a');
            buttonEl.className = 'home-feature__button';
            buttonEl.href = videoUrl;
            buttonEl.target = '_blank';
            buttonEl.rel = 'noopener noreferrer';
            buttonEl.setAttribute('aria-label', 'おすすめ動画を開く');

            const imageEl = document.createElement('img');
            imageEl.src = thumbnailUrl;
            imageEl.alt = cfg.main_text || 'おすすめ動画';
            buttonEl.appendChild(imageEl);
            homeFeatured.appendChild(buttonEl);
          }

          const carouselIds = [
            cfg.carousel_url_id_1,
            cfg.carousel_url_id_2,
            cfg.carousel_url_id_3,
            cfg.carousel_url_id_4,
            cfg.carousel_url_id_5,
            cfg.carousel_url_id_6,
          ].filter(Boolean);

          if (cfg.carousel_text || carouselIds.length) {
            const carouselWrap = document.createElement('div');
            carouselWrap.className = 'home-carousel';

            if (cfg.carousel_text) {
              const carouselTitle = document.createElement('p');
              carouselTitle.className = 'home-carousel__title';
              carouselTitle.textContent = cfg.carousel_text;
              carouselWrap.appendChild(carouselTitle);
            }

            if (carouselIds.length) {
              const viewport = document.createElement('div');
              viewport.className = 'home-carousel__viewport';

              const track = document.createElement('div');
              track.className = 'home-carousel__track';

              const groups = [];
              for (let i = 0; i < carouselIds.length; i += 2) {
                const group = document.createElement('div');
                group.className = 'home-carousel__group';
                const pair = carouselIds.slice(i, i + 2);
                pair.forEach((videoId) => {
                  const itemLink = document.createElement('a');
                  itemLink.className = 'home-carousel__link';
                  itemLink.href = `https://www.youtube.com/watch?v=${videoId}`;
                  itemLink.target = '_blank';
                  itemLink.rel = 'noopener noreferrer';
                  itemLink.setAttribute('aria-label', 'おすすめ動画を開く');

                  const imageEl = document.createElement('img');
                  imageEl.className = 'home-carousel__image';
                  imageEl.src = `https://i.ytimg.com/vi/${videoId}/hq720.jpg`;
                  imageEl.alt = 'おすすめ動画';
                  itemLink.appendChild(imageEl);
                  group.appendChild(itemLink);
                });
                groups.push(group);
              }

              groups.forEach((group) => track.appendChild(group));
              viewport.appendChild(track);
              carouselWrap.appendChild(viewport);

              const dots = document.createElement('div');
              dots.className = 'home-carousel__dots';
              const totalGroups = groups.length;
              for (let i = 0; i < totalGroups; i += 1) {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'home-carousel__dot';
                dot.setAttribute('aria-label', `カルーセル ${i + 1}`);
                dots.appendChild(dot);
              }
              carouselWrap.appendChild(dots);

              if (totalGroups > 1) {
                let currentGroup = 0;
                const updateDots = () => {
                  Array.from(dots.children).forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentGroup);
                  });
                };

                updateDots();
                window.setInterval(() => {
                  currentGroup = (currentGroup + 1) % totalGroups;
                  track.style.transform = `translateX(-${currentGroup * 100}%)`;
                  updateDots();
                }, 4000);
              }
            }

            homeFeatured.appendChild(carouselWrap);
          }
        }

        // ライブ情報更新日を設定
        if (cfg.date) {
          const liveUpdateNote = document.getElementById('liveUpdateNote');
          if (liveUpdateNote) {
            liveUpdateNote.textContent = `${cfg.date} 更新`;
          }
          const musicUpdateNote = document.getElementById('musicUpdateNote');
          if (musicUpdateNote) {
            musicUpdateNote.textContent = `${cfg.date} 更新`;
          }
          const videoUpdateNote = document.getElementById('videoUpdateNote');
          if (videoUpdateNote) {
            videoUpdateNote.textContent = `${cfg.date} 更新`;
          }
          const contactUpdateNote = document.getElementById('contactUpdateNote');
          if (contactUpdateNote) {
            contactUpdateNote.textContent = `${cfg.date} 更新`;
          }
          const omakeUpdateNote = document.getElementById('omakeUpdateNote');
          if (omakeUpdateNote) {
            omakeUpdateNote.textContent = `${cfg.date} 更新`;
          }
        }
      }
    } catch (error) {
      console.warn('config.json の読み込みに失敗しました', error);
    }
  };

  configLoadPromise = loadConfig();

  const navToggle = document.getElementById("navToggle");
  const navPanel = document.getElementById("navPanel");
  const navBackdrop = document.getElementById("navBackdrop");
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  const subpanelScrollToTopBtn = document.getElementById("subpanelScrollToTopBtn");
  const subpanel = document.getElementById("liveSubpanel");
  const subpanelPanel = subpanel?.querySelector(".live-subpanel__panel");
  const subpanelBackdrop = document.getElementById("liveSubpanelBackdrop");
  const subpanelClose = document.getElementById("liveSubpanelClose");
  const subpanelContent = document.getElementById("liveSubpanelContent");

  const updateScrollToTopButton = () => {
    if (!scrollToTopBtn) return;

    const isScrollable = document.documentElement.scrollHeight > window.innerHeight + 1;
    const isScrolled = window.scrollY > 0 || document.documentElement.scrollTop > 0;
    scrollToTopBtn.hidden = !(isScrollable && isScrolled);
  };

  const updateSubpanelScrollToTopButton = () => {
    if (!subpanelPanel || !subpanelScrollToTopBtn) return;

    const isScrollable = subpanelPanel.scrollHeight > subpanelPanel.clientHeight + 1;
    const isScrolled = subpanelPanel.scrollTop > 0;
    subpanelScrollToTopBtn.hidden = !(isScrollable && isScrolled);
  };

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

  scrollToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  subpanelScrollToTopBtn?.addEventListener("click", () => {
    if (subpanelPanel) {
      subpanelPanel.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  subpanelPanel?.addEventListener("scroll", updateSubpanelScrollToTopButton, { passive: true });

  navBackdrop?.addEventListener("click", closeNav);

  window.addEventListener("scroll", updateScrollToTopButton, { passive: true });
  window.addEventListener("resize", () => {
    updateScrollToTopButton();
    updateSubpanelScrollToTopButton();
  });
  window.addEventListener("load", () => {
    updateScrollToTopButton();
    updateSubpanelScrollToTopButton();
  });
  updateScrollToTopButton();
  updateSubpanelScrollToTopButton();

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

  const hashToTabName = (hash) => {
    switch ((hash || "").replace(/^#/, "").toLowerCase()) {
      case "home":
      case "":
        return "home";
      case "live":
        return "live";
      case "song":
      case "music":
        return "music";
      case "video":
        return "video";
      case "contact":
        return "contact";
      case "omake":
        return "omake";
      default:
        return "home";
    }
  };

  const tabNameToHash = (tabName) => {
    switch (tabName) {
      case "live":
        return "#live";
      case "music":
        return "#song";
      case "video":
        return "#video";
      case "contact":
        return "#contact";
      case "omake":
        return "#omake";
      default:
        return "#home";
    }
  };

  const setActivePage = (tabName, { updateHash = false } = {}) => {
    const normalizedTabName = hashToTabName(tabName);

    // すべてのタブとページから active クラスを削除
    tabs.forEach((tab) => tab.classList.remove("active"));
    pages.forEach((page) => page.classList.remove("active"));

    // アクティブなタブとページに active クラスを追加
    document.querySelector(`[data-tab="${normalizedTabName}"]`)?.classList.add("active");
    document.querySelector(`[data-page="${normalizedTabName}"]`)?.classList.add("active");

    if (updateHash) {
      const newHash = tabNameToHash(normalizedTabName);
      if (window.location.hash !== newHash) {
        window.location.hash = newHash;
      }
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.getAttribute("data-tab");
      if (!tabName) return;
      setActivePage(tabName, { updateHash: true });
    });
  });

  const navigateToHash = () => {
    setActivePage(window.location.hash);
  };

  window.addEventListener("hashchange", navigateToHash);
  navigateToHash();

  navPanel?.addEventListener("click", (e) => {
    const a = e.target?.closest?.("a");
    if (a) closeNav();
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 769px)").matches) closeNav();
  });

  const liveList = document.getElementById("liveList");
  const songList = document.getElementById("songList");
  const omakeList = document.getElementById("omakeList");
  const omakeSortCountBtn = document.getElementById("omakeSortCountBtn");
  const omakeSortDateBtn = document.getElementById("omakeSortDateBtn");
  const omakeSortResetBtn = document.getElementById("omakeSortResetBtn");
  const videoList = document.getElementById("videoList");
  const songSearchForm = document.getElementById("songSearchForm");
  const songSearchInput = document.getElementById("songSearchInput");
  let sortedLives = [];
  let musicIndex = new Map();
  let omakeSortCountState = "default";
  let omakeSortDateState = "default";

  const getLiveIdNumber = (liveId) => {
    const match = String(liveId).match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  };

  const getSongIdNumber = (songId) => {
    const match = String(songId).match(/(\d+)/);
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

  const setSubpanelVisibility = (isOpen) => {
    if (!subpanel) return;

    if (isOpen) {
      resetSubpanelScroll();
      subpanel.classList.add("open");
      subpanel.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      return;
    }

    resetSubpanelScroll();
    subpanel.classList.remove("open");
    subpanel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const closeSubpanel = (options = {}) => {
    if (!subpanel) return;

    if (!subpanel.classList.contains("open") && !options.fromPopState) {
      return;
    }

    setSubpanelVisibility(false);

    if (!options.fromPopState) {
      const currentState = window.history.state;
      if (currentState?.liveSubpanelOpen !== false) {
        window.history.pushState({ liveSubpanelOpen: false }, "", window.location.href);
      }
    }
  };

  let allSongs = [];

  const formatSingerName = (value) => {
    const text = value ?? "";
    return text.length > 9 ? `${text.slice(0, 9)}…` : text;
  };

  const hasSongLink = (song) => {
    const rawUrl = song?.sing_url;
    const normalizedUrl = typeof rawUrl === "string" ? rawUrl.trim() : "";
    const singCount = Number(song?.sing_count ?? 0);
    return singCount > 0 && normalizedUrl !== "" && normalizedUrl !== "null" && normalizedUrl.toLowerCase() !== "null";
  };

  const normalizeSearchText = (value) => {
    return String(value ?? "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  };

  const getSongSearchText = (song) => {
    return normalizeSearchText(song?.find_char || song?.song_title || "");
  };

  const getKaraokeLinkUrl = (song) => {
    if (!searchSongFlag) return "";
    const karaokeUrl = typeof song?.used_find_song === 'string' ? song.used_find_song.trim() : '';
    return karaokeUrl || "";
  };

  const parseSingDay = (value) => {
    const text = String(value ?? "").trim();
    const match = text.match(/^(\d{2,})年(\d{2})月(\d{2})日$/);
    if (!match) return 0;
    const [, year, month, day] = match;
    return Number(year) * 10000 + Number(month) * 100 + Number(day);
  };

  const updateOmakeSortButtons = () => {
    if (!omakeSortCountBtn || !omakeSortDateBtn || !omakeSortResetBtn) return;

    const getArrow = (state) => {
      if (state === "asc") return "▲";
      if (state === "desc") return "▼";
      return "";
    };

    omakeSortCountBtn.textContent = `歌唱回数 ${getArrow(omakeSortCountState)}`.trim();
    omakeSortDateBtn.textContent = `日付 ${getArrow(omakeSortDateState)}`.trim();

    omakeSortCountBtn.classList.toggle("active", omakeSortCountState !== "default");
    omakeSortDateBtn.classList.toggle("active", omakeSortDateState !== "default");
    omakeSortResetBtn.classList.toggle("active", omakeSortCountState !== "default" || omakeSortDateState !== "default");
  };

  const sortOmakeItems = (items) => {
    const compareNumber = (a, b, direction) => {
      return direction === "asc" ? a - b : b - a;
    };

    const compareDate = (a, b, direction) => {
      const left = parseSingDay(a);
      const right = parseSingDay(b);
      return direction === "asc" ? left - right : right - left;
    };

    if (omakeSortCountState === "default" && omakeSortDateState === "default") {
      return [...items];
    }

    return [...items].sort((a, b) => {
      if (omakeSortCountState !== "default") {
        const result = compareNumber(Number(a?.sing_count ?? 0), Number(b?.sing_count ?? 0), omakeSortCountState);
        if (result !== 0) return result;
      }

      if (omakeSortDateState !== "default") {
        const result = compareDate(a?.sing_day, b?.sing_day, omakeSortDateState);
        if (result !== 0) return result;
      }

      return 0;
    });
  };

  const renderOmakeSongList = (rows) => {
    if (!omakeList) return;

    if (!rows.length) {
      omakeList.innerHTML = '<p class="song-list__empty">対象の曲が見つかりませんでした</p>';
      return;
    }

    omakeList.innerHTML = `
      <div class="omake-list__header">
        <span class="omake-list__col omake-list__col--title">曲名</span>
        <span class="omake-list__col omake-list__col--singer">歌唱回数</span>
        <span class="omake-list__col omake-list__col--url">日付</span>
        <span class="omake-list__col omake-list__col--detail"  style="text-align: center;">URL</span>
      </div>
      ${rows.map((song) => {
        const songUrl = hasSongLink(song) ? String(song.sing_url).trim() : "";
        const urlLinkMarkup = songUrl
          ? `<a class="song-list__link" href="${songUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(song.song_title || "曲")} の動画を開く"><img src="./assets/play.png" alt="再生" /></a>`
          : '<span class="song-list__empty">URLなし</span>';

        return `
          <div class="omake-list__row">
            <div class="omake-list__cell omake-list__cell--title">${escapeHtml(song.song_title || "曲名未登録")}</div>
            <div class="omake-list__cell omake-list__cell--singer">${escapeHtml(String(song.sing_count || ""))}</div>
            <div class="omake-list__cell omake-list__cell--url">${escapeHtml(song.sing_day || "")} </div>
            <div class="omake-list__cell omake-list__cell--detail">${urlLinkMarkup}</div>
          </div>
        `;
      }).join("")}
    `;
  };

  const renderOmakeList = async () => {
    if (!omakeList) return;

    try {
      const response = await fetch("./data/download_song_file.json");
      if (!response.ok) throw new Error("OMAKE用の曲データを読み込めませんでした");

      const songs = await response.json();
      const items = Array.isArray(songs) ? songs : [];
      const filteredItems = items.filter((song) => {
        const count = Number(song?.sing_count ?? 0);
        return count >= 1;
      });

      renderOmakeSongList(sortOmakeItems(filteredItems));
    } catch (error) {
      omakeList.innerHTML = `<p class="song-list__empty">${escapeHtml(error.message)}</p>`;
    }
  };

  const renderSongList = (rows) => {
    if (!songList) return;

    if (!rows.length) {
      songList.innerHTML = '<p class="song-list__empty">ヒットしませんでした</p>';
      return;
    }

    songList.innerHTML = `
      <div class="song-list__header">
        <span class="song-list__col song-list__col--title">曲名</span>
        <span class="song-list__col song-list__col--singer">歌手</span>
        <span class="song-list__col song-list__col--url" style="text-align: center;">URL</span>
        <span class="song-list__col song-list__col--detail" style="text-align: center;">詳細</span>
      </div>
      ${rows.map((song) => {
        const singerName = formatSingerName(song.singer_name || "");
        const songUrl = hasSongLink(song) ? song.sing_url.trim() : "";
        const karaokeUrl = getKaraokeLinkUrl(song);

        const urlLinkMarkup = songUrl
          ? `<a class="song-list__link" href="${songUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(song.song_title || "曲")} の動画を開く"><img src="./assets/play.png" alt="YouTube" /></a>`
          : "";

        return `
          <div class="song-list__row">
            <div class="song-list__cell song-list__cell--title">${escapeHtml(song.song_title || "曲名未登録")}</div>
            <div class="song-list__cell song-list__cell--singer">${escapeHtml(singerName)}</div>
            <div class="song-list__cell song-list__cell--url">${urlLinkMarkup}</div>
            <div class="song-list__cell song-list__cell--detail">
              <button
                class="song-list__detail-btn"
                type="button"
                data-song-title="${escapeHtml(song.song_title || "")}" 
                data-song-singer="${escapeHtml(song.singer_name || "")}" 
                data-song-lyrics="${escapeHtml(song.lyrics_composition_name || "")}" 
                data-song-lyrics-url="${escapeHtml(song.song_lyrics || "")}"
                data-song-karaoke-url="${escapeHtml(karaokeUrl)}"
                aria-label="${escapeHtml(song.song_title || "曲")} の詳細を開く"
              >︙</button>
            </div>
            <span aria-hidden="true" style="display:none;">${escapeHtml(song.find_char || "")}</span>
          </div>
        `;
      }).join("")}
    `;
  };

  const renderSongs = async () => {
    if (!songList) return;

    try {
      await configLoadPromise;
      const response = await fetch("./data/download_song_file.json");
      if (!response.ok) throw new Error("曲データを読み込めませんでした");

      const songs = await response.json();
      allSongs = Array.isArray(songs) ? songs : [];
      const query = normalizeSearchText(songSearchInput?.value || "");
      const filteredSongs = query
        ? allSongs.filter((song) => getSongSearchText(song).includes(query))
        : allSongs;

      renderSongList(filteredSongs);
    } catch (error) {
      songList.innerHTML = `<p class="live-card__empty">${error.message}</p>`;
    }
  };

  const renderVideos = async () => {
    if (!videoList) return;

    try {
      const response = await fetch("./data/download_video_file.json");
      if (!response.ok) throw new Error("ビデオ情報を読み込めませんでした");

      const videos = await response.json();
      const items = Array.isArray(videos) ? videos : [];
      const sortedItems = [...items].sort((a, b) => {
        const aId = Number(String(a?.video_id || "").replace(/\D/g, "")) || 0;
        const bId = Number(String(b?.video_id || "").replace(/\D/g, "")) || 0;
        return bId - aId;
      });

      if (!sortedItems.length) {
        videoList.innerHTML = '<p class="video-list__empty">ビデオ情報はまだありません。</p>';
        return;
      }

      videoList.innerHTML = sortedItems.map((video) => {
        const videoUrl = video?.video_url || "#";
        const videoImage = getVideoImageSrc(video);
        const videoSetting = video?.video_setting || "";
        const videoName = video?.name || "動画タイトル未登録";

        return `
          <a class="video-card" href="${videoUrl}" target="_blank" rel="noopener noreferrer" aria-label="${videoName} を開く">
            <div class="video-card__media">
              <img class="video-card__image" src="${videoImage}" alt="${videoName}" loading="lazy" ${makeImageFallbackAttr()} />
              <span class="video-card__badge">${videoSetting}</span>
            </div>
            <div class="video-card__title">${videoName}</div>
          </a>
        `;
      }).join("");
    } catch (error) {
      videoList.innerHTML = `<p class="video-list__empty">${error.message}</p>`;
    }
  };

  const openSubpanel = (live, songs) => {
    if (!subpanel || !subpanelContent) return;
    resetSubpanelScroll();

    const liveUrlWithTimestamp = live.url ? `${live.url}&t=1s` : "#";
    const songMarkup = songs.length
      ? `<div class="live-subpanel__songs">${songs.map((song) => `
          <div class="live-subpanel__song">
            <div class="live-subpanel__song-number">${song.song_id || ""}</div>
            <div class="live-subpanel__song-title">${song.title || "曲名未登録"}</div>
            <a class="live-subpanel__song-link" href="${song.url || "#"}" target="_blank" rel="noopener noreferrer" aria-label="${song.title || "曲"} の動画を開く">
              <img src="./assets/play.png" alt="YouTube" />
            </a>
          </div>
        `).join("")}</div>`
      : '<p class="live-subpanel__empty">このライブの曲情報はまだありません。</p>';

    const joyBadgeMarkup = joySongFlag && live.live_joy === true
      ? `<span class="live-subpanel__joy-badge">JoySound</span>`
      : "";

    subpanelContent.innerHTML = `
      <a class="live-subpanel__hero-link" href="${liveUrlWithTimestamp}" target="_blank" rel="noopener noreferrer" aria-label="ライブ動画を開く">
        ${joyBadgeMarkup}
        <img class="live-subpanel__hero" src="${getLiveImageSrc(live)}" alt="${live.live_id}" ${makeImageFallbackAttr()} />
      </a>
      <p class="live-subpanel__meta">曲リスト</p>
      ${songMarkup}
    `;

    setSubpanelVisibility(true);

    const currentState = window.history.state;
    if (currentState?.liveSubpanelOpen !== true) {
      window.history.pushState({ liveSubpanelOpen: true }, "", window.location.href);
    }
  };

  const openSongSubpanel = async (song) => {
    if (!subpanel || !subpanelContent) return;
    resetSubpanelScroll();

    const songTitle = String(song?.song_title || "").trim();
        const karaokeUrl = searchSongFlag ? (song?.karaoke_url || "") : "";
        const karaokeMarkup = searchSongFlag && karaokeUrl
      ? `<a class="song-subpanel__link" href="${karaokeUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(songTitle || "曲")} のカラオケ検索を開く">カラオケ検索</a>`
      : "";

        const rawLyricsUrl = song?.lyrics_url || "";
        const lyricsUrl = (typeof rawLyricsUrl === 'string') ? rawLyricsUrl.trim() : "";
        const hasLyrics = lyricsUrl && lyricsUrl.toLowerCase() !== "null";
        const lyricsMarkup = hasLyrics
      ? `<a class="song-subpanel__link" href="${lyricsUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(songTitle || "曲")} の歌詞を開く">歌詞</a>`
      : "";

        const actionsMarkup = (karaokeMarkup || lyricsMarkup) ? `<div class="song-subpanel__actions">${karaokeMarkup}${lyricsMarkup}</div>` : "";

    subpanelContent.innerHTML = `
      <div class="song-subpanel">
        <p class="live-subpanel__meta">曲詳細</p>
        <div class="song-subpanel__field">
          <div class="song-subpanel__label">曲名</div>
          <div class="song-subpanel__value">${escapeHtml(songTitle || "曲名未登録")}</div>
        </div>
        <div class="song-subpanel__field">
          <div class="song-subpanel__label">歌手</div>
          <div class="song-subpanel__value">${escapeHtml(song?.singer_name || "歌手未登録")}</div>
        </div>
        <div class="song-subpanel__field">
          <div class="song-subpanel__label">作詞・作曲</div>
          <div class="song-subpanel__value">${escapeHtml(song?.lyrics_composition_name || "作詞・作曲未登録")}</div>
        </div>
        ${actionsMarkup}
        <div class="song-subpanel__history">
          <div class="song-subpanel__history-title">History</div>
          <div class="song-subpanel__history-loading">読み込み中...</div>
        </div>
      </div>
    `;

    setSubpanelVisibility(true);

    const currentState = window.history.state;
    if (currentState?.liveSubpanelOpen !== true) {
      window.history.pushState({ liveSubpanelOpen: true }, "", window.location.href);
    }

    try {
      const [musicResponse, liveResponse] = await Promise.all([
        fetch("./data/download_music_file.json"),
        fetch("./data/download_live_file.json")
      ]);

      if (!musicResponse.ok) throw new Error("曲履歴を読み込めませんでした");
      if (!liveResponse.ok) throw new Error("ライブ情報を読み込めませんでした");

      const musicData = await musicResponse.json();
      const liveData = await liveResponse.json();
      const liveTextMap = new Map(
        (Array.isArray(liveData) ? liveData : []).map((liveEntry) => [String(liveEntry?.live_id || "").trim(), liveEntry?.live_text || ""])
      );
      const liveJoyMap = new Map(
        (Array.isArray(liveData) ? liveData : []).map((liveEntry) => [String(liveEntry?.live_id || "").trim(), liveEntry?.live_joy === true])
      );

      const historyEntries = [];
      (Array.isArray(musicData) ? musicData : []).forEach((liveEntry) => {
        const liveId = String(liveEntry?.live_id || "").trim();
        if (!liveId) return;

        (Array.isArray(liveEntry?.songs) ? liveEntry.songs : []).forEach((historySong) => {
          if (String(historySong?.title || "").trim() !== songTitle) return;

          historyEntries.push({
            liveId,
            songId: historySong?.song_id || "",
            url: historySong?.url || "",
            liveText: liveTextMap.get(liveId) || "",
            liveJoy: liveJoyMap.get(liveId) === true
          });
        });
      });

      historyEntries.sort((a, b) => {
        const liveDifference = getLiveIdNumber(a.liveId) - getLiveIdNumber(b.liveId);
        if (liveDifference !== 0) return liveDifference;
        return getSongIdNumber(a.songId) - getSongIdNumber(b.songId);
      });

      const historyMarkup = historyEntries.length
        ? `<div class="song-subpanel__history-list">${historyEntries.map((entry, index) => {
            const hasJoyBadge = joySongFlag && entry.liveJoy;
            return `
            <div class="song-subpanel__history-item${hasJoyBadge ? ' song-subpanel__history-item--with-badge' : ''}">
              <div class="song-subpanel__history-no">${index + 1}</div>
              <div class="song-subpanel__history-live">${escapeHtml(entry.liveText || "ライブ未登録")}</div>
              ${hasJoyBadge ? `<span class="song-subpanel__history-badge">Joy</span>` : ""}
              <a class="song-subpanel__history-link" href="${entry.url || "#"}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(songTitle || "曲")} の履歴動画を開く">
                <img src="./assets/play.png" alt="再生" />
              </a>
            </div>
          `;
          }).join("")}</div>`
        : '<div class="song-subpanel__history-empty">履歴情報はまだありません。</div>';

      if (subpanelContent) {
        const hasJoyHistory = joySongFlag && historyEntries.some((entry) => entry.liveJoy);
        const lyricsActionBadge = hasJoyHistory && hasLyrics ? `<span class="song-subpanel__action-badge">JoySound</span>` : "";
        const lyricsButtonMarkup = hasLyrics
          ? `<span class="song-subpanel__link-wrapper"><a class="song-subpanel__link" href="${lyricsUrl}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(songTitle || "曲")} の歌詞を開く">歌詞</a>${lyricsActionBadge}</span>`
          : "";
        const actionsMarkupWithJoy = (karaokeMarkup || lyricsButtonMarkup)
          ? `<div class="song-subpanel__actions">${karaokeMarkup}${lyricsButtonMarkup}</div>`
          : "";

        subpanelContent.innerHTML = `
          <div class="song-subpanel">
            <p class="live-subpanel__meta">曲詳細</p>
            <div class="song-subpanel__field">
              <div class="song-subpanel__label">曲名</div>
              <div class="song-subpanel__value">${escapeHtml(songTitle || "曲名未登録")}</div>
            </div>
            <div class="song-subpanel__field">
              <div class="song-subpanel__label">歌手</div>
              <div class="song-subpanel__value">${escapeHtml(song?.singer_name || "歌手未登録")}</div>
            </div>
            <div class="song-subpanel__field">
              <div class="song-subpanel__label">作詞・作曲</div>
              <div class="song-subpanel__value">${escapeHtml(song?.lyrics_composition_name || "作詞・作曲未登録")}</div>
            </div>
            ${actionsMarkupWithJoy}
            <div class="song-subpanel__history">
              <div class="song-subpanel__history-title">History</div>
              ${historyMarkup}
            </div>
          </div>
        `;
      }
    } catch (error) {
      if (subpanelContent) {
        subpanelContent.innerHTML = `
          <div class="song-subpanel">
            <p class="live-subpanel__meta">曲詳細</p>
            <div class="song-subpanel__field">
              <div class="song-subpanel__label">曲名</div>
              <div class="song-subpanel__value">${escapeHtml(songTitle || "曲名未登録")}</div>
            </div>
            <div class="song-subpanel__field">
              <div class="song-subpanel__label">歌手</div>
              <div class="song-subpanel__value">${escapeHtml(song?.singer_name || "歌手未登録")}</div>
            </div>
            <div class="song-subpanel__field">
              <div class="song-subpanel__label">作詞・作曲</div>
              <div class="song-subpanel__value">${escapeHtml(song?.lyrics_composition_name || "作詞・作曲未登録")}</div>
            </div>
            ${karaokeMarkup ? `<div class="song-subpanel__actions">${karaokeMarkup}</div>` : ""}
            <div class="song-subpanel__history">
              <div class="song-subpanel__history-title">History</div>
              <div class="song-subpanel__history-empty">${escapeHtml(error.message || "履歴を読み込めませんでした")}</div>
            </div>
          </div>
        `;
      }
    }
  };

  const renderLives = async () => {
    if (!liveList) return;

    if (configLoadPromise) {
      await configLoadPromise;
    }

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

      liveList.innerHTML = sortedLives.map((live) => {
        const joyBadgeMarkup = joySongFlag && live.live_joy === true
          ? `<span class="live-card__joy-badge">JoySound</span>`
          : "";

        return `
          <article class="live-card">
            <div class="live-card__media">
              <img class="live-card__image" src="${getLiveImageSrc(live)}" alt="${live.live_id}" data-live-id="${live.live_id}" loading="lazy" ${makeImageFallbackAttr()} />
              ${joyBadgeMarkup}
              <span class="live-card__badge">${live.live_setting}</span>
            </div>
          </article>
        `;
      }).join("");
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

  songList?.addEventListener("click", (event) => {
    const detailButton = event.target.closest(".song-list__detail-btn");
    if (!detailButton) return;

    openSongSubpanel({
      song_title: detailButton.getAttribute("data-song-title") || "",
      singer_name: detailButton.getAttribute("data-song-singer") || "",
      lyrics_composition_name: detailButton.getAttribute("data-song-lyrics") || "",
      lyrics_url: detailButton.getAttribute("data-song-lyrics-url") || "",
      karaoke_url: detailButton.getAttribute("data-song-karaoke-url") || ""
    });
  });

  songSearchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    renderSongs();
  });

  songSearchInput?.addEventListener("input", () => {
    if (!songSearchInput.value.trim()) {
      renderSongs();
    }
  });

  omakeSortCountBtn?.addEventListener("click", () => {
    if (omakeSortCountState === "default") {
      omakeSortCountState = "desc";
    } else if (omakeSortCountState === "desc") {
      omakeSortCountState = "asc";
    } else {
      omakeSortCountState = "default";
    }
    updateOmakeSortButtons();
    renderOmakeList();
  });

  omakeSortDateBtn?.addEventListener("click", () => {
    if (omakeSortDateState === "default") {
      omakeSortDateState = "desc";
    } else if (omakeSortDateState === "desc") {
      omakeSortDateState = "asc";
    } else {
      omakeSortDateState = "default";
    }
    updateOmakeSortButtons();
    renderOmakeList();
  });

  omakeSortResetBtn?.addEventListener("click", () => {
    omakeSortCountState = "default";
    omakeSortDateState = "default";
    updateOmakeSortButtons();
    renderOmakeList();
  });
  subpanelBackdrop?.addEventListener("click", closeSubpanel);
  subpanelClose?.addEventListener("click", closeSubpanel);
  window.addEventListener("popstate", () => {
    const shouldOpen = window.history.state?.liveSubpanelOpen === true;
    setSubpanelVisibility(shouldOpen);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSubpanel();
  });

  updateOmakeSortButtons();
  renderLives();
  renderSongs();
  renderOmakeList();
  renderVideos();
})();
