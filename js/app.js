const state = {
  lang: localStorage.getItem("lang") || "en",
  files: [],
  tags: [],
  search: "",
  filterTag: "",
  loaded: false,
};

const i18n = {
  en: {
    eyebrow: "Open Vocab Registry",
    title: "JP Vocab Data Library",
    subtitle:
      "Lightweight JSON packs for Japanese learners. Browse, filter, and share with a pull request.",
    langLabel: "Language",
    statFiles: "Files",
    statItems: "Items",
    searchLabel: "Search",
    searchPlaceholder: "Search by file or tag",
    filterLabel: "Filter by tag",
    libraryTitle: "Data Library",
    librarySubtitle: "Each card is a JSON file stored in /data.",
    uploadTitle: "Upload / Share",
    uploadSubtitle: "Validate a JSON file locally before you open a pull request.",
    howTitle: "How to use",
    howSubtitle: "Copy a JSON link and plug it into your vocabulary app.",
    howStep1: "Pick a dataset and download the JSON file.",
    howStep2: "Copy its link:",
    howStep3: "Paste the link into your app and load the vocabulary list.",
    statusLoading: "Loading data index...",
    statusReady: "Loaded {count} files.",
    statusEmpty: "No files match your search.",
    statusError: "Could not load /data/index.json yet. Add data and refresh.",
    filterAll: "All tags",
    download: "Download",
    view: "View JSON",
    items: "items",
    tagSummary: "Tags",
    uploadHint:
      "Choose a JSON file to preview. Required fields: jp, vi. Optional: reading, tags, examples.",
    uploadInvalid: "JSON is invalid or missing items[].",
    uploadValid: "JSON looks good.",
    uploadCount: "Items: {count}",
    uploadTags: "Tags: {count}",
    copyTemplate: "Copy link template",
    copyDone: "Copied!",
    copyFail: "Copy failed. Please copy manually.",
    prHintTitle: "Open a PR",
    prHint:
      "Add your file under /data and append its name to /data/index.json.",
    previewSample: "Preview",
  },
  vi: {
    eyebrow: "Kho Tu Vung Mo",
    title: "JP Vocab Data Library",
    subtitle:
      "Thu vien JSON nhe cho nguoi hoc tieng Nhat. Duyet, loc va chia se qua pull request.",
    langLabel: "Ngon ngu",
    statFiles: "Tap tin",
    statItems: "Muc tu",
    searchLabel: "Tim kiem",
    searchPlaceholder: "Tim theo ten file hoac tag",
    filterLabel: "Loc theo tag",
    libraryTitle: "Thu vien du lieu",
    librarySubtitle: "Moi the la mot file JSON trong /data.",
    uploadTitle: "Tai len / Chia se",
    uploadSubtitle: "Kiem tra file JSON truoc khi mo pull request.",
    howTitle: "Cach su dung",
    howSubtitle: "Copy link JSON va gan vao app tu vung cua ban.",
    howStep1: "Chon mot bo du lieu va tai file JSON.",
    howStep2: "Copy link:",
    howStep3: "Dan link vao app va tai danh sach tu vung.",
    statusLoading: "Dang tai danh sach du lieu...",
    statusReady: "Da tai {count} tap tin.",
    statusEmpty: "Khong co tap tin phu hop.",
    statusError: "Chua co /data/index.json. Hay them du lieu va tai lai.",
    filterAll: "Tat ca tag",
    download: "Tai ve",
    view: "Xem JSON",
    items: "muc",
    tagSummary: "Tag",
    uploadHint:
      "Chon file JSON de xem truoc. Bat buoc: jp, vi. Tuy chon: reading, tags, examples.",
    uploadInvalid: "JSON khong hop le hoac thieu items[].",
    uploadValid: "JSON hop le.",
    uploadCount: "So muc: {count}",
    uploadTags: "So tag: {count}",
    copyTemplate: "Copy link template",
    copyDone: "Da copy!",
    copyFail: "Khong the copy. Hay tu copy thu cong.",
    prHintTitle: "Mo PR",
    prHint: "Them file vao /data va ghi ten vao /data/index.json.",
    previewSample: "Xem truoc",
  },
};

const els = {
  langToggle: document.getElementById("langToggle"),
  searchInput: document.getElementById("searchInput"),
  tagFilter: document.getElementById("tagFilter"),
  cardGrid: document.getElementById("cardGrid"),
  status: document.getElementById("status"),
  statFiles: document.getElementById("statFiles"),
  statItems: document.getElementById("statItems"),
  fileInput: document.getElementById("fileInput"),
  uploadResult: document.getElementById("uploadResult"),
};

function applyI18n() {
  const dict = i18n[state.lang];
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) {
      el.setAttribute("placeholder", dict[key]);
    }
  });
  els.langToggle.textContent = state.lang.toUpperCase();
  renderStatus();
  renderFilterOptions();
  renderCards();
  renderUploadHint();
}

function renderStatus(message) {
  if (message) {
    els.status.textContent = message;
    return;
  }
  if (!state.loaded) {
    els.status.textContent = i18n[state.lang].statusError;
    return;
  }
  els.status.textContent = i18n[state.lang].statusReady.replace(
    "{count}",
    state.files.length
  );
}

function setStats() {
  const totalItems = state.files.reduce((sum, file) => sum + file.count, 0);
  els.statFiles.textContent = state.files.length;
  els.statItems.textContent = totalItems;
}

function normalize(value) {
  return value.toLowerCase();
}

function matchesSearch(file) {
  if (!state.search) return true;
  const query = normalize(state.search);
  if (normalize(file.name).includes(query)) return true;
  return file.tags.some((tag) => normalize(tag).includes(query));
}

function matchesFilter(file) {
  if (!state.filterTag) return true;
  return file.tags.includes(state.filterTag);
}

function createTagList(tags) {
  const wrap = document.createElement("div");
  wrap.className = "tag-list";
  tags.forEach((tag) => {
    const pill = document.createElement("span");
    pill.className = "tag";
    pill.textContent = tag;
    wrap.appendChild(pill);
  });
  return wrap;
}

function renderCards() {
  const dict = i18n[state.lang];
  els.cardGrid.innerHTML = "";
  const filtered = state.files.filter((file) => matchesSearch(file) && matchesFilter(file));
  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = dict.statusEmpty;
    els.cardGrid.appendChild(empty);
    return;
  }
  filtered.forEach((file) => {
    const card = document.createElement("article");
    card.className = "data-card";

    const title = document.createElement("h3");
    title.className = "data-card__title";
    title.textContent = file.name;

    const meta = document.createElement("p");
    meta.className = "data-card__meta";
    meta.textContent = `${file.count} ${dict.items}`;

    const summary = document.createElement("p");
    summary.className = "data-card__meta";
    summary.textContent = `${dict.tagSummary}: ${file.tagSummary}`;

    const tags = createTagList(file.tags.slice(0, 6));

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const download = document.createElement("a");
    download.className = "btn btn--solid";
    download.textContent = dict.download;
    download.href = `data/${file.name}`;
    download.setAttribute("download", file.name);

    const view = document.createElement("a");
    view.className = "btn";
    view.textContent = dict.view;
    view.href = `data/${file.name}`;
    view.target = "_blank";
    view.rel = "noopener";

    actions.appendChild(download);
    actions.appendChild(view);

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(summary);
    card.appendChild(tags);
    card.appendChild(actions);

    els.cardGrid.appendChild(card);
  });
}

function renderFilterOptions() {
  const dict = i18n[state.lang];
  els.tagFilter.innerHTML = "";
  const optionAll = document.createElement("option");
  optionAll.value = "";
  optionAll.textContent = dict.filterAll;
  els.tagFilter.appendChild(optionAll);

  state.tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    els.tagFilter.appendChild(option);
  });
  els.tagFilter.value = state.filterTag;
}

function renderUploadHint() {
  const dict = i18n[state.lang];
  if (!els.uploadResult.dataset.state) {
    els.uploadResult.textContent = dict.uploadHint;
  }
}

async function loadData() {
  renderStatus(i18n[state.lang].statusLoading);
  try {
    const response = await fetch("data/index.json");
    if (!response.ok) throw new Error("index.json missing");
    const list = await response.json();
    if (!Array.isArray(list)) throw new Error("index.json must be array");

    const results = await Promise.allSettled(
      list.map(async (filename) => {
        const fileResponse = await fetch(`data/${filename}`);
        if (!fileResponse.ok) throw new Error("file missing");
        const data = await fileResponse.json();
        if (!Array.isArray(data.items)) throw new Error("items missing");
        const tagCounts = new Map();
        data.items.forEach((item) => {
          if (!Array.isArray(item.tags)) return;
          item.tags.forEach((tag) => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          });
        });
        const tags = Array.from(tagCounts.keys()).sort();
        const topTags = Array.from(tagCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([tag, count]) => `${tag}(${count})`);
        return {
          name: filename,
          count: data.items.length,
          tags,
          tagSummary: topTags.length ? topTags.join(", ") : "-",
        };
      })
    );

    state.files = results
      .filter((entry) => entry.status === "fulfilled")
      .map((entry) => entry.value);
    state.loaded = true;

    const tagSet = new Set();
    state.files.forEach((file) => file.tags.forEach((tag) => tagSet.add(tag)));
    state.tags = Array.from(tagSet).sort();

    setStats();
    renderStatus();
    renderFilterOptions();
    renderCards();
  } catch (error) {
    state.files = [];
    state.tags = [];
    state.loaded = false;
    setStats();
    renderStatus(i18n[state.lang].statusError);
  }
}

function validateJson(data) {
  if (!data || !Array.isArray(data.items)) return false;
  return data.items.every((item) => {
    if (!item || typeof item !== "object") return false;
    if (typeof item.jp !== "string" || typeof item.vi !== "string") return false;
    if (item.reading && typeof item.reading !== "string") return false;
    if (item.tags && !Array.isArray(item.tags)) return false;
    if (item.examples && !Array.isArray(item.examples)) return false;
    return true;
  });
}

function buildUploadPreview(data, filename) {
  const dict = i18n[state.lang];
  const tags = new Set();
  data.items.forEach((item) => {
    if (Array.isArray(item.tags)) {
      item.tags.forEach((tag) => tags.add(tag));
    }
  });

  const wrapper = document.createElement("div");
  wrapper.className = "preview";

  const status = document.createElement("strong");
  status.textContent = dict.uploadValid;

  const count = document.createElement("div");
  count.textContent = dict.uploadCount.replace("{count}", data.items.length);

  const tagCount = document.createElement("div");
  tagCount.textContent = dict.uploadTags.replace("{count}", tags.size);

  const sample = document.createElement("div");
  sample.textContent = `${dict.previewSample}: ${data.items
    .slice(0, 3)
    .map((item) => item.jp)
    .join(", ") || "-"}`;

  const linkWrap = document.createElement("div");
  const linkInput = document.createElement("input");
  linkInput.type = "text";
  linkInput.value = `/data/${filename}`;
  linkInput.readOnly = true;
  linkInput.setAttribute("aria-label", "link template");

  const copyBtn = document.createElement("button");
  copyBtn.className = "btn btn--solid";
  copyBtn.type = "button";
  copyBtn.textContent = dict.copyTemplate;

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(linkInput.value);
      copyBtn.textContent = dict.copyDone;
      setTimeout(() => {
        copyBtn.textContent = dict.copyTemplate;
      }, 1200);
    } catch (err) {
      copyBtn.textContent = dict.copyFail;
    }
  });

  linkWrap.appendChild(linkInput);
  linkWrap.appendChild(copyBtn);
  linkWrap.style.display = "flex";
  linkWrap.style.gap = "10px";
  linkWrap.style.flexWrap = "wrap";

  const prTitle = document.createElement("strong");
  prTitle.textContent = dict.prHintTitle;

  const prHint = document.createElement("div");
  prHint.textContent = dict.prHint;

  wrapper.appendChild(status);
  wrapper.appendChild(count);
  wrapper.appendChild(tagCount);
  wrapper.appendChild(sample);
  wrapper.appendChild(linkWrap);
  wrapper.appendChild(prTitle);
  wrapper.appendChild(prHint);

  return wrapper;
}

els.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value.trim();
  renderCards();
});

els.tagFilter.addEventListener("change", (event) => {
  state.filterTag = event.target.value;
  renderCards();
});

els.langToggle.addEventListener("click", () => {
  state.lang = state.lang === "en" ? "vi" : "en";
  localStorage.setItem("lang", state.lang);
  applyI18n();
});

els.fileInput.addEventListener("change", async (event) => {
  const dict = i18n[state.lang];
  const file = event.target.files[0];
  if (!file) return;
  const content = await file.text();
  try {
    const json = JSON.parse(content);
    if (!validateJson(json)) {
      els.uploadResult.dataset.state = "invalid";
      els.uploadResult.textContent = dict.uploadInvalid;
      return;
    }
    els.uploadResult.dataset.state = "valid";
    els.uploadResult.innerHTML = "";
    els.uploadResult.appendChild(buildUploadPreview(json, file.name));
  } catch (error) {
    els.uploadResult.dataset.state = "invalid";
    els.uploadResult.textContent = dict.uploadInvalid;
  }
});

applyI18n();
loadData();
