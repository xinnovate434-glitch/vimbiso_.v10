(function () {
  var cfg = function () { return window.VIMBISO_CFG || {}; };
  var IMG = "images/";
  var S = {
    screen: localStorage.getItem("v_uid") ? "home" : "welcome",
    phone: localStorage.getItem("v_phone") || "",
    name: localStorage.getItem("v_name") || "",
    city: localStorage.getItem("v_city") || "Harare",
    userId: localStorage.getItem("v_uid") || "",
    status: localStorage.getItem("v_status") || "pending",
    role: localStorage.getItem("v_role") || "buyer",
    vid: localStorage.getItem("v_vid") || "",
    need: "", qty: "20", price: "", ai: "", weather: "", toast: "",
    chatPeerId: "", chatPeerName: "", chatPeerPhone: "", chatMsgs: [],
    selectedOffer: null, payMethod: "cash", bidCat: "veg",
  };

  function toast(m) { S.toast = m; draw(); setTimeout(function () { S.toast = ""; draw(); }, 2800); }
  function go(s) { S.screen = s; draw(); }
  function esc(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function saveUser(u) {
    S.userId = u.id; S.name = u.name || S.name; S.phone = u.phone || S.phone;
    S.city = u.city || S.city; S.status = u.status || "pending"; S.vid = u.vimbiso_id || S.vid || "";
    localStorage.setItem("v_uid", S.userId); localStorage.setItem("v_name", S.name);
    localStorage.setItem("v_phone", S.phone); localStorage.setItem("v_city", S.city);
    localStorage.setItem("v_status", S.status); localStorage.setItem("v_role", S.role);
    if (S.vid) localStorage.setItem("v_vid", S.vid);
  }

  async function rest(path, init) {
    var c = cfg();
    if (!c.supabaseUrl || !c.supabaseAnon) return { error: "Set Supabase secrets on GitHub, rebuild APK" };
    try {
      var res = await fetch(c.supabaseUrl.replace(/\/$/, "") + "/rest/v1/" + path, Object.assign({}, init, {
        headers: Object.assign({
          apikey: c.supabaseAnon, Authorization: "Bearer " + c.supabaseAnon,
          "Content-Type": "application/json", Prefer: "return=representation"
        }, (init && init.headers) || {})
      }));
      if (!res.ok) return { error: await res.text() };
      if (res.status === 204) return { data: null };
      return { data: await res.json() };
    } catch (e) { return { error: e.message || "Network error" }; }
  }

  async function assist(msg) {
    var key = cfg().geminiKey;
    if (!key) return msg ? 'Got "' + msg + '". Add qty and price, then post to the network.' : "Welcome to Vimbiso. How can I assist you today?";
    try {
      var res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + encodeURIComponent(key), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Vimbiso Zimbabwe trade assistant. 1-2 short sentences. No fake traders. User: " + (msg || "hello") }] }], generationConfig: { maxOutputTokens: 100 } })
      });
      var data = await res.json();
      var t = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.map(function (p) { return p.text || ""; }).join("")) || "";
      return t.trim() || "Tell me what you need.";
    } catch (e) { return "Type what you need."; }
  }

  async function loadWeather() {
    var key = cfg().weatherKey; if (!key) return;
    try {
      var res = await fetch("https://api.openweathermap.org/data/2.5/weather?q=" + encodeURIComponent(S.city || "Harare") + ",ZW&units=metric&appid=" + key);
      var d = await res.json();
      if (d && d.main) S.weather = Math.round(d.main.temp) + "°C · " + ((d.weather && d.weather[0] && d.weather[0].main) || "");
    } catch (e) {}
  }

  function nav() {
    return '<div class="nav">' +
      '<button class="' + (S.screen === "home" ? "on" : "") + '" data-go="home">Home</button>' +
      '<button class="' + (S.screen === "bid" ? "on" : "") + '" data-go="bid">Bid</button>' +
      '<button class="' + (S.screen === "trade" ? "on" : "") + '" data-go="trade">Trade</button>' +
      '<button class="' + (S.screen === "offers" ? "on" : "") + '" data-go="offers">Offers</button>' +
      '<button class="' + (S.screen === "profile" ? "on" : "") + '" data-go="profile">Profile</button></div>';
  }

  function itemLabel(items) {
    try { if (Array.isArray(items) && items[0] && items[0].name) return items[0].name; } catch (e) {}
    return "Open request";
  }

  async function draw() {
    var el = document.getElementById("app"), h = "";

    if (S.screen === "welcome") {
      h = '<div class="screen"><div class="bg" style="background-image:url(' + IMG + 'bg-welcome.jpg)"></div><div class="content">' +
        '<div class="logo">VIMBISO NETWORK</div><div class="h1">Trade in real time.</div>' +
        '<p class="sub">Search what you need. Real traders respond. No fake catalogue browsing.</p>' +
        '<div class="stats"><div class="stat"><b>Live</b><span>Network</span></div><div class="stat"><b>ZW</b><span>Markets</span></div><div class="stat"><b>Real</b><span>IDs only</span></div></div>' +
        '<div class="spacer"></div><button class="btn btn-gold" data-go="signin">Get started</button>' +
        '<button class="btn btn-outline" data-go="signin">I already have an account</button></div></div>';
    } else if (S.screen === "signin") {
      h = '<div class="screen dark"><div class="bg" style="background-image:url(' + IMG + 'bg-signin.jpg)"></div><div class="content">' +
        '<div class="top"><button class="back" data-go="welcome">←</button><span class="logo">JOIN</span><span></span></div>' +
        '<div class="h1" style="font-size:26px">Join the network</div><p class="sub">Phone is your identity. Admin approves new accounts.</p>' +
        "<label>Full name</label><input id='name' value='" + esc(S.name) + "'/>" +
        "<label>Phone</label><input id='phone' value='" + esc(S.phone) + "' placeholder='+263 7…'/>" +
        "<label>City</label><input id='city' value='" + esc(S.city) + "'/>" +
        "<label>I am a</label><select id='role'><option value='buyer'>Buyer</option><option value='trader'>Trader</option><option value='both'>Both</option></select>" +
        '<button class="btn btn-gold" id="reg">Continue</button></div></div>';
    } else if (S.screen === "home") {
      h = '<div class="screen"><div class="bg" style="background-image:url(' + IMG + 'bg-home.jpg)"></div><div class="content pad-nav">' +
        '<div class="top"><div class="logo">VIMBISO</div><span class="badge' + (S.status === "approved" ? "" : " badge-warn") + '">' + esc(S.status) + "</span></div>" +
        '<div class="h1" style="font-size:24px">Hi' + (S.name ? ", " + esc(S.name.split(" ")[0]) : "") + "</div>" +
        '<p class="sub">' + (S.weather ? esc(S.weather) + " · " : "") + esc(S.city) + "</p>" +
        '<div class="card-dark"><div style="font-size:11px;opacity:.7;margin-bottom:6px">ASSISTANT</div><div id="aiText">' + esc(S.ai || "…") + "</div></div>" +
        "<label style='color:rgba(255,255,255,.75)'>What do you need?</label>" +
        "<input id='need' value='" + esc(S.need) + "' placeholder='e.g. tomatoes 20kg, Chitungwiza'/>" +
        '<div class="row"><button class="btn btn-gold" id="ask" style="flex:1">Ask AI</button><button class="btn btn-teal" id="toBid" style="flex:1">Build bid</button></div>' +
        nav() + "</div></div>";
      if (!S.ai) assist("").then(function (t) { S.ai = t; var n = document.getElementById("aiText"); if (n) n.textContent = t; });
      loadWeather().then(function () { if (S.weather) { /* optional refresh */ } });
    } else if (S.screen === "bid") {
      h = '<div class="screen" style="background:#f4f1ea"><div class="content pad-nav">' +
        '<div class="top"><button class="back dark" data-go="home">←</button><b>Build your bid</b><span></span></div>' +
        '<img src="' + IMG + 'item-tomatoes.jpg" alt="" style="width:100%;height:140px;object-fit:cover;border-radius:16px"/>' +
        "<label>Item</label><input id='need' value='" + esc(S.need) + "' placeholder='Tomatoes'/>" +
        '<div class="cat-grid">' +
        [["veg","cat-veg.jpg","Veg"],["food","cat-food.jpg","Food"],["electronics","cat-electronics.jpg","Tech"],["clothing","cat-clothing.jpg","Wear"]].map(function (c) {
          return '<button type="button" data-cat="' + c[0] + '"><img src="' + IMG + c[1] + '" alt=""/><span>' + c[2] + "</span></button>";
        }).join("") + "</div>" +
        "<label>Quantity</label><input id='qty' value='" + esc(S.qty) + "'/>" +
        "<label>Your bid (USD)</label><input id='price' type='number' value='" + esc(S.price) + "' placeholder='15'/>" +
        '<button class="btn btn-teal" id="postBid">Post bid to network</button>' +
        '<p class="muted">Real traders only. No fake listings.</p>' + nav() + "</div></div>";
    } else if (S.screen === "trade") {
      h = '<div class="screen"><div class="bg" style="background-image:url(' + IMG + 'bg-trader.jpg)"></div><div class="content pad-nav">' +
        '<div class="top"><button class="back" data-go="home">←</button><span class="logo">TRADER</span><span class="badge">Live</span></div>' +
        '<div class="h1" style="font-size:22px">Buyer requests</div><p class="sub">Tap a request and send your live offer</p>' +
        '<div id="bidlist" style="margin-top:12px"><p class="sub">Loading…</p></div>' + nav() + "</div></div>";
      setTimeout(loadBidsUI, 0);
    } else if (S.screen === "offers") {
      h = '<div class="screen" style="background:#f4f1ea"><div class="content pad-nav">' +
        '<div class="top"><button class="back dark" data-go="home">←</button><b>Live offers</b><span class="badge">Network</span></div>' +
        '<div class="card" style="background:#0e2a47;color:#fff"><div style="opacity:.7;font-size:11px">Your need</div><b>' + esc(S.need || "Open network") + "</b></div>" +
        '<div id="olist"><p class="muted">Watching network…</p></div>' + nav() + "</div></div>";
      setTimeout(loadOffersUI, 0);
    } else if (S.screen === "order") {
      h = '<div class="screen" style="background:#f4f1ea"><div class="content">' +
        '<div class="top"><button class="back dark" data-go="offers">←</button><b>Confirm & pay</b><span></span></div>' +
        '<div class="card"><b>' + esc(S.chatPeerName || "Trader") + "</b>" +
        (S.chatPeerPhone ? "<br/><span class='muted'>" + esc(S.chatPeerPhone) + "</span>" : "") +
        "<br/><span class='muted'>" + esc(S.need || "Items") + "</span></div>" +
        '<div class="row"><button class="btn btn-ghost" id="payCash" style="margin-top:0">Cash</button><button class="btn btn-ghost" id="payEco" style="margin-top:0">EcoCash</button></div>' +
        '<p class="muted">EcoCash: dial *151# then agree in chat. Auto-settle needs merchant API later.</p>' +
        '<button class="btn btn-teal" id="confirmOrder">Confirm order</button>' +
        '<button class="btn btn-navy" id="goChat">Chat</button>' +
        (S.chatPeerPhone ? '<a class="btn btn-gold" style="text-align:center;text-decoration:none" href="tel:' + esc(S.chatPeerPhone) + '">Call</a>' : "") +
        "</div></div>";
    } else if (S.screen === "chat") {
      h = '<div class="screen" style="background:#f4f1ea"><div class="content">' +
        '<div class="top"><button class="back dark" data-go="order">←</button><b>' + esc(S.chatPeerName || "Chat") + "</b>" +
        (S.chatPeerPhone ? '<a class="badge" href="tel:' + esc(S.chatPeerPhone) + '">Call</a>' : "<span></span>") + "</div>" +
        '<div id="msgs" style="flex:1;overflow:auto;min-height:45vh"></div>' +
        '<div class="row"><input id="msg" placeholder="Message…" style="flex:1;margin:0"/><button class="btn btn-teal" id="send" style="width:auto;margin:0;padding:12px 16px">Send</button></div></div></div>';
      setTimeout(function () {
        if (!S.chatMsgs.length) S.chatMsgs = [{ me: false, body: "Hi — let's agree price and meeting point." }];
        renderMsgs();
      }, 0);
    } else if (S.screen === "profile") {
      h = '<div class="screen"><div class="bg" style="background-image:url(' + IMG + 'bg-profile.jpg)"></div><div class="content pad-nav">' +
        '<div class="top"><button class="back" data-go="home">←</button><span class="logo">PROFILE</span><span></span></div>' +
        '<div class="card"><div class="logo" style="color:#0f766e">VIMBISO ID</div>' +
        '<div style="font-size:22px;font-weight:900;margin:8px 0">' + esc(S.vid || "After signup") + "</div>" +
        "<b>" + esc(S.name || "—") + "</b><br/><span class='muted'>" + esc(S.phone) + " · " + esc(S.city) + "</span><br/>" +
        '<span class="badge' + (S.status === "approved" ? "" : " badge-warn") + '">' + esc(S.status) + "</span>" +
        '<div style="margin-top:12px;text-align:center"><img src="' + IMG + 'qr-id.png" width="120" height="120" alt="QR" style="border-radius:12px;background:#fff;padding:8px"/></div></div>' +
        '<button class="btn btn-outline" id="out">Sign out</button>' + nav() + "</div></div>";
    }

    el.innerHTML = h + (S.toast ? '<div class="toast">' + esc(S.toast) + "</div>" : "");
    bind();
  }

  function renderMsgs() {
    var box = document.getElementById("msgs"); if (!box) return;
    box.innerHTML = (S.chatMsgs || []).map(function (m) {
      return '<div class="msg ' + (m.me ? "me" : "them") + '">' + esc(m.body) + "</div>";
    }).join("");
    box.scrollTop = box.scrollHeight;
  }

  function bind() {
    document.querySelectorAll("[data-go]").forEach(function (b) {
      b.onclick = function () { go(b.getAttribute("data-go")); };
    });
    document.querySelectorAll("[data-cat]").forEach(function (b) {
      b.onclick = function () { S.bidCat = b.getAttribute("data-cat"); toast("Category: " + S.bidCat); };
    });
    var reg = document.getElementById("reg");
    if (reg) reg.onclick = async function () {
      S.name = document.getElementById("name").value.trim();
      S.phone = document.getElementById("phone").value.trim();
      S.city = document.getElementById("city").value.trim() || "Harare";
      S.role = document.getElementById("role").value;
      if (!S.name || !S.phone) return toast("Name and phone required");
      var roles = S.role === "both" ? ["buyer", "trader"] : S.role === "trader" ? ["trader"] : ["buyer"];
      var r = await rest("users", { method: "POST", body: JSON.stringify({ phone: S.phone, name: S.name, city: S.city, roles: roles, status: "pending" }) });
      if (r.error && (String(r.error).indexOf("23505") >= 0 || String(r.error).indexOf("phone") >= 0)) {
        var f = await rest("users?phone=eq." + encodeURIComponent(S.phone) + "&select=*");
        if (f.data && f.data[0]) { saveUser(f.data[0]); toast("Welcome back"); go("home"); return; }
      }
      if (r.error) return toast(String(r.error).slice(0, 90));
      if (r.data && r.data[0]) { saveUser(r.data[0]); toast("Registered — pending approval"); go("home"); }
    };
    var ask = document.getElementById("ask");
    if (ask) ask.onclick = async function () {
      S.need = document.getElementById("need").value;
      var t = await assist(S.need); S.ai = t;
      var n = document.getElementById("aiText"); if (n) n.textContent = t;
    };
    var toBid = document.getElementById("toBid");
    if (toBid) toBid.onclick = function () {
      var n = document.getElementById("need"); if (n) S.need = n.value; go("bid");
    };
    var postBid = document.getElementById("postBid");
    if (postBid) postBid.onclick = async function () {
      S.need = document.getElementById("need").value;
      S.qty = document.getElementById("qty").value;
      S.price = document.getElementById("price").value;
      if (!S.userId) return toast("Sign in first");
      if (!S.need) return toast("Enter an item");
      var r = await rest("bids", { method: "POST", body: JSON.stringify({
        buyer_id: S.userId,
        items: [{ name: S.need, qty: parseFloat(S.qty) || 1, unit: "kg", price: parseFloat(S.price) || 0 }],
        city: S.city, status: "open"
      }) });
      if (r.error) return toast(String(r.error).slice(0, 90));
      toast("Bid live on the network"); go("offers");
    };
    var payCash = document.getElementById("payCash");
    if (payCash) payCash.onclick = function () { S.payMethod = "cash"; toast("Cash on handover"); };
    var payEco = document.getElementById("payEco");
    if (payEco) payEco.onclick = function () { S.payMethod = "ecocash"; toast("EcoCash *151#"); };
    var confirmOrder = document.getElementById("confirmOrder");
    if (confirmOrder) confirmOrder.onclick = async function () {
      if (!S.userId || !S.chatPeerId) return toast("Pick a trader from offers");
      var r = await rest("orders", { method: "POST", body: JSON.stringify({
        buyer_id: S.userId, trader_id: S.chatPeerId, items: [{ name: S.need || "Items" }],
        subtotal: parseFloat(S.price) || 0, delivery_fee: 0, total: parseFloat(S.price) || 0,
        payment_method: S.payMethod, payment_status: "pending", order_status: "placed", city: S.city
      }) });
      if (r.error) return toast(String(r.error).slice(0, 90));
      toast("Order placed"); go("chat");
    };
    var goChat = document.getElementById("goChat");
    if (goChat) goChat.onclick = function () { go("chat"); };
    var send = document.getElementById("send");
    if (send) send.onclick = function () {
      var input = document.getElementById("msg");
      var text = (input && input.value || "").trim();
      if (!text) return;
      S.chatMsgs.push({ me: true, body: text });
      if (input) input.value = "";
      renderMsgs();
    };
    var out = document.getElementById("out");
    if (out) out.onclick = function () { localStorage.clear(); S.userId = ""; S.name = ""; go("welcome"); };
  }

  async function loadBidsUI() {
    var box = document.getElementById("bidlist"); if (!box) return;
    var r = await rest("bids?status=eq.open&select=*&order=created_at.desc&limit=40");
    if (r.error) { box.innerHTML = '<div class="card-dark">' + esc(String(r.error).slice(0, 100)) + "</div>"; return; }
    var rows = r.data || [];
    if (!rows.length) { box.innerHTML = '<div class="card-dark">No open bids yet</div>'; return; }
    box.innerHTML = rows.map(function (b) {
      return '<button class="list-btn" data-bid="' + b.id + '"><b>' + esc(itemLabel(b.items)) +
        "</b><br/><span class='muted'>" + esc(b.city || "") + "</span></button>";
    }).join("");
    box.querySelectorAll("[data-bid]").forEach(function (btn) {
      btn.onclick = function () { sendOffer(btn.getAttribute("data-bid")); };
    });
  }

  async function sendOffer(bidId) {
    if (!S.userId) return toast("Sign in as trader");
    var price = prompt("Your live offer price (USD)"); if (!price) return;
    var r = await rest("offers", { method: "POST", body: JSON.stringify({
      trader_id: S.userId, bid_id: bidId, price: parseFloat(price), status: "active", fulfillment: "delivery", quality: "standard"
    }) });
    if (r.error) return toast(String(r.error).slice(0, 90));
    toast("Live offer sent");
  }

  async function loadOffersUI() {
    var box = document.getElementById("olist"); if (!box) return;
    var r = await rest("offers?status=eq.active&select=*&order=created_at.desc&limit=40");
    if (r.error) { box.innerHTML = '<div class="card muted">' + esc(String(r.error).slice(0, 100)) + "</div>"; return; }
    var rows = r.data || [];
    if (!rows.length) { box.innerHTML = '<div class="card muted">Waiting for traders…</div>'; return; }
    var ids = []; rows.forEach(function (o) { if (o.trader_id && ids.indexOf(o.trader_id) < 0) ids.push(o.trader_id); });
    var map = {};
    if (ids.length) {
      var u = await rest("users?id=in.(" + ids.join(",") + ")&select=id,name,phone,vimbiso_id");
      (u.data || []).forEach(function (x) { map[x.id] = x; });
    }
    box.innerHTML = rows.map(function (o) {
      var t = map[o.trader_id] || {};
      return '<button class="list-btn" data-oid="' + o.id + '" data-tid="' + o.trader_id +
        '" data-tname="' + esc(t.name || "Trader") + '" data-tphone="' + esc(t.phone || "") +
        '"><div class="price">$' + Number(o.price).toFixed(2) + "</div><b>" + esc(t.name || "Trader") +
        "</b><br/><span class='muted'>" + esc(o.fulfillment || "") + " · " + esc(t.vimbiso_id || "") + "</span></button>";
    }).join("");
    box.querySelectorAll("[data-oid]").forEach(function (btn) {
      btn.onclick = function () {
        S.selectedOffer = btn.getAttribute("data-oid");
        S.chatPeerId = btn.getAttribute("data-tid");
        S.chatPeerName = btn.getAttribute("data-tname");
        S.chatPeerPhone = btn.getAttribute("data-tphone");
        go("order");
      };
    });
  }

  draw();
})();
