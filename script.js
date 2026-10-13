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

  updateArchives();
})();