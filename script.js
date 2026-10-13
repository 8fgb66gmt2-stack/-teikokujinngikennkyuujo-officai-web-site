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


  // Archive catalogue entries open a detailed, in-world bibliographic record.
  document.querySelectorAll(".archive-item").forEach(item => {
    const openRecord = () => {
      const id = item.querySelector(".archive-id")?.textContent?.trim() || "識別番号未詳";
      const title = item.querySelector("h3")?.textContent?.trim() || "史料名未詳";
      const type = item.querySelector(".archive-type")?.textContent?.trim() || "分類未詳";
      const summary = item.querySelector("div p:last-child")?.textContent?.trim() || "公開目録に登録された史料です。";
      showDialog("史料個別記録　／　" + id, title + "\n\n" + type + "\n\n" + summary + "\n\n公開區分：一般公開\n閲覧方法：公開抄録を閲覧できます。原本・全文の利用は、各史料の指定および所定の手続に従ってください。");
    };
    item.addEventListener("click", event => {
      if (event.target.closest("a,button,input")) return;
      openRecord();
    });
    item.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openRecord(); }
    });
  });

  const bulletins = {
    boundary: {title:"神域境界の維持と定期確認", message:"研究紀要 第238–01號\n所管：神域調査局\n\n鳥居、参道、境内標識および周辺環境の変化を定期的に記録し、過年度の調査結果と照合するための公開概要です。神域の保全に關する個別記録は、公開指定の範囲内でのみ閲覧できます。"},
    season: {title:"四季神性反応の比較觀測", message:"研究紀要 第238–02號\n所管：神性觀測部\n\n季節ごとの観測記録を同一の基準で整理し、変動傾向を比較するための公開概要です。個別の神性反応値および未承認の観測記録は本報に含まれません。"},
    archive: {title:"祭祀古寫本の保存と閲覧", message:"研究紀要 第238–03號\n所管：史料保存室\n\n祭祀古寫本について、書誌情報、保存状態、公開範囲を分けて記録し、閲覧時の取扱いを明確にするための案内です。閲覧時は史料番号を確認し、原本への接触や撮影について所管者の指示に従ってください。"}
  };
  document.querySelectorAll("[data-bulletin]").forEach(button => button.addEventListener("click", () => {
    const item = bulletins[button.dataset.bulletin];
    if (item) showDialog(item.title, item.message);
  }));

  const inquiryForm = document.getElementById("archiveInquiryForm");
  const inquiryInput = document.getElementById("archiveInquiryInput");
  const inquiryStatus = document.getElementById("archiveInquiryStatus");
  inquiryForm?.addEventListener("submit", event => {
    event.preventDefault();
    const code = (inquiryInput?.value || "").trim().toUpperCase();
    if (inquiryStatus) inquiryStatus.textContent = "";
    const record = archiveItems.find(item => (item.querySelector(".archive-id")?.textContent || "").trim().toUpperCase() === code);
    if (record) {
      record.hidden = false;
      activeFilter = "all";
      filterButtons.forEach(button => {
        const active = (button.dataset.filter || "all") === "all";
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      if (search) search.value = code;
      updateArchives();
      document.getElementById("catalog")?.scrollIntoView({behavior:"smooth",block:"start"});
      record.focus({preventScroll:true});
      showDialog("史料照会　／　" + code, "照会対象の登録を確認しました。\n\n目録の該当記録を表示しています。記録を選択すると、書誌情報および閲覧条件を確認できます。");
    } else if (code === "SH-000") {
      showDialog("照会保留　／　SH-000", "該当する記録は公開目録に登録されていません。\n\n備考：境界維持記録の照合を要す。\n\nこの照会番号に關する追加情報は、公開目録の対象外です。");
    } else if (code === "GKT-000") {
      showDialog("臺帳照合　／　GKT-000", "識別番号の形式を確認しました。\n\nただし、対応する公開記録は確認できません。照会履歴は所定の手続に基づき保存されます。\n\n照会先：神祇史料庫・特別整理係");
    } else if (code === "KAGURA-238") {
      showDialog("特別照会　／　KAGURA-238", "照会資格の形式を確認しました。\n\n閲覧許可を付与するものではありません。関連記録の取扱いについては、神祇史料庫の所管手続に従ってください。\n\n記録附記：『記録にないことは、存在しないことを意味しない。』");
    } else {
      showDialog("史料照会", "照会番号「" + code + "」に一致する公開目録は見つかりませんでした。識別番号を確認のうえ、再度照会してください。");
    }
  });

  updateArchives();
})();