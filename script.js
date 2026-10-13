(() => {
  const menuToggle = document.getElementById("menuToggle");
  const primaryNav = document.getElementById("primaryNav");
  if (menuToggle && primaryNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = primaryNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
    primaryNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      primaryNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }));
  }

  const search = document.getElementById("archiveSearch");
  const archiveItems = [...document.querySelectorAll(".archive-item")];
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const noResults = document.getElementById("noResults");
  const resultCount = document.getElementById("resultCount");
  let activeFilter = "all";

  function updateArchives() {
    const term = (search?.value || "").trim().toLocaleLowerCase();
    let visible = 0;
    archiveItems.forEach(item => {
      const matchesCategory = activeFilter === "all" || item.dataset.category === activeFilter;
      const haystack = (item.dataset.search + " " + item.innerText).toLocaleLowerCase();
      const matchesTerm = !term || haystack.includes(term);
      const show = matchesCategory && matchesTerm;
      item.hidden = !show;
      if (show) visible += 1;
    });
    if (resultCount) resultCount.textContent = String(visible);
    if (noResults) noResults.hidden = visible !== 0;
  }
  search?.addEventListener("input", updateArchives);
  search?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      updateArchives();
    }
  });
  filterButtons.forEach(button => button.addEventListener("click", () => {
    activeFilter = button.dataset.filter || "all";
    filterButtons.forEach(other => {
      const active = other === button;
      other.classList.toggle("active", active);
      other.setAttribute("aria-pressed", String(active));
    });
    updateArchives();
  }));

  const dialog = document.getElementById("noticeDialog");
  const dialogTitle = document.getElementById("dialogTitle");
  const dialogMessage = document.getElementById("dialogMessage");
  const closeDialog = () => {
    if (dialog?.open) dialog.close();
  };
  function showDialog(title, message) {
    if (!dialog) return;
    if (dialogTitle) dialogTitle.textContent = title;
    if (dialogMessage) dialogMessage.textContent = message;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else window.alert(title + "\n\n" + message);
  }
  document.getElementById("requestAccess")?.addEventListener("click", () => {
    showDialog("閲覧案内", "公開史料目録に掲載された史料は、各目録の指定に従って閲覧できます。閲覧制限史料については、所属機關を通じて所定の申請を行ってください。");
  });
  document.getElementById("dialogClose")?.addEventListener("click", closeDialog);
  document.getElementById("dialogConfirm")?.addEventListener("click", closeDialog);
  dialog?.addEventListener("click", event => {
    if (event.target === dialog) closeDialog();
  });

  document.querySelectorAll("[data-coming]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      showDialog("機關案内", link.dataset.coming + "の公式情報網は、現在接続先を確認中です。");
    });
  });

  // A small archival easter egg: a non-listed reference number reveals a restricted-record notice.
  search?.addEventListener("input", () => {
    const term = search.value.trim().toUpperCase();
    if (term === "SH-000" || term === "GKT-000") {
      showDialog("史料照会", "照会番号：SH-000\n\n該当する史料は、公開目録に登録されていません。追加の照会については、所定の手続を行ってください。");
      search.value = "";
      updateArchives();
    }
  });


  // Interactive precinct directory: select a building on the plan or in the directory.
  const places = {
    torii:{number:"01 / 08",kicker:"神域への入口",title:"一之鳥居",english:"FIRST TORII / SACRED THRESHOLD",description:"境内と外界を分かつ境界標識。ここをくぐるところから、神域への巡覧が始まります。",type:"境界施設",access:"一般案内"},
    approach:{number:"02 / 08",kicker:"社殿へ至る道",title:"參道",english:"SAN道 / APPROACH",description:"鳥居から社殿へと続く道。参拝者と研究者が心を整え、神域の奥へ進むための道筋です。",type:"境内通路",access:"一般案内"},
    temizu:{number:"03 / 08",kicker:"清めの場",title:"手水舎",english:"TEMIZUYA / PURIFICATION",description:"祭祀や参拝に先立ち、手と口を清めるための施設。神域へ入る前の作法を案内しています。",type:"祭祀補助施設",access:"一般案内"},
    haiden:{number:"04 / 08",kicker:"祈りを捧げる場",title:"拝殿",english:"HAIDEN / WORSHIP HALL",description:"祈りを捧げ、公開祭祀を執り行う場。公開日程および参拝上の案内は所内掲示に従ってください。",type:"祭祀施設",access:"指定時公開"},
    honden:{number:"05 / 08",kicker:"神域の中心",title:"本殿",english:"HONDEN / INNER SANCTUARY",description:"神祇を奉安する神域の中心。祭祀および神祇記録に關する重要な儀式が執り行われます。",type:"祭祀施設",access:"一般案内・内部非公開"},
    archive:{number:"06 / 08",kicker:"記録を護る庫",title:"神祇史料庫",english:"DIVINE ARCHIVES / RECORDS",description:"祭祀記録、古文書、神祇関連史料を収蔵・保存する施設。公開目録に登録された書誌情報を検索できます。",type:"史料保存施設",access:"申請・指定閲覧"},
    observatory:{number:"07 / 08",kicker:"神性を観測する場",title:"神性觀測棟",english:"DIVINE PHENOMENA OBSERVATORY",description:"神性反応、神域環境および季節変動を継續観測する研究施設。安全上の理由により、観測区画は原則非公開です。",type:"研究施設",access:"職員・許可者のみ"},
    restricted:{number:"08 / 08",kicker:"公開案内対象外",title:"禁足區域",english:"RESTRICTED ZONE / NO ENTRY",description:"保全および調査上の理由により立入りを制限している區域です。位置・所管記録等の詳細については回答できません。",type:"立入制限區域",access:"立入禁止"}
  };
  function selectPlace(key) {
    const item = places[key];
    if (!item) return;
    [["placeNumber","number"],["placeKicker","kicker"],["placeTitle","title"],["placeEnglish","english"],["placeDescription","description"],["placeType","type"],["placeAccess","access"]].forEach(([id,field]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = item[field];
    });
    document.querySelectorAll("[data-place]").forEach(button => {
      const active = button.dataset.place === key;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-place-map]").forEach(group => {
      const active = group.dataset.placeMap === key;
      group.classList.toggle("is-selected", active);
      group.setAttribute("aria-pressed", String(active));
    });
  }
  document.querySelectorAll("[data-place]").forEach(button => button.addEventListener("click", () => selectPlace(button.dataset.place)));
  document.querySelectorAll("[data-place-map]").forEach(group => {
    group.addEventListener("click", () => selectPlace(group.dataset.placeMap));
    group.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectPlace(group.dataset.placeMap); }
    });
  });
  const seasons = {
    spring:{glyph:"春",code:"OBS–SPR–238 / 第壹期",title:"芽吹き期・神性循環觀測",description:"神域内の神性反応は緩やかな上昇傾向。若葉の展開に伴う境界領域の変化を継續観測中。",level:"安定",width:"82%",note:"基準値内 / 定期報告"},
    summer:{glyph:"夏",code:"OBS–SUM–238 / 第貳期",title:"繁茂期・神域環境觀測",description:"高温期における神域環境と神性反応の相関を記録。観測棟周辺の反応値は平年範囲内。",level:"注意觀測",width:"66%",note:"変動あり / 継續觀測"},
    autumn:{glyph:"秋",code:"OBS–AUT–238 / 第參期",title:"收斂期・祭祀記録照合",description:"祭祀記録と神性反応の照合を実施。史料間の記述差について、追加の編纂作業を進めています。",level:"照合中",width:"74%",note:"記録照合 / 継續中"},
    winter:{glyph:"冬",code:"OBS–WIN–238 / 第肆期",title:"靜謐期・境界維持觀測",description:"神域境界の維持状況を重点確認。夜間の観測値は安定していますが、一部記録は閲覧制限対象です。",level:"限定公開",width:"58%",note:"一部閲覧制限 / 要確認"}
  };
  document.querySelectorAll("[data-season]").forEach(button => button.addEventListener("click", () => {
    const item = seasons[button.dataset.season];
    if (!item) return;
    document.querySelectorAll("[data-season]").forEach(other => {
      const active = other === button;
      other.classList.toggle("active", active);
      other.setAttribute("aria-pressed", String(active));
    });
    [["seasonGlyph","glyph"],["seasonCode","code"],["seasonTitle","title"],["seasonDescription","description"],["seasonLevel","level"],["seasonNote","note"]].forEach(([id,field]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = item[field];
    });
    const meter = document.getElementById("seasonMeter");
    if (meter) meter.style.width = item.width;
  }));

  updateArchives();
})();