(function () {
  const cfg = () => window.VIMBISO_CFG || {};
  const S = {
    screen: localStorage.getItem("v_uid") ? "home" : "welcome",
    phone: localStorage.getItem("v_phone") || "",
    name: localStorage.getItem("v_name") || "",
    city: localStorage.getItem("v_city") || "Harare",
    userId: localStorage.getItem("v_uid") || "",
    status: localStorage.getItem("v_status") || "pending",
    role: localStorage.getItem("v_role") || "buyer",
    vid: localStorage.getItem("v_vid") || "",
    need: "",
    qty: "20",
    price: "",
    bids: [],
    offers: [],
    ai: "",
    toast: "",
    selectedOffer: null,
  };

  function toast(m) {
    S.toast = m;
    draw();
    setTimeout(function () {
      S.toast = "";
      draw();
    }, 2800);
  }

  function saveUser(u) {
    S.userId = u.id;
    S.name = u.name || S.name;
    S.phone = u.phone || S.phone;
    S.city = u.city || S.city;
    S.status = u.status || "pending";
    S.vid = u.vimbiso_id || S.vid || "";
    localStorage.setItem("v_uid", S.userId);
    localStorage.setItem("v_name", S.name);
    localStorage.setItem("v_phone", S.phone);
    localStorage.setItem("v_city", S.city);
    localStorage.setItem("v_status", S.status);
    localStorage.setItem("v_role", S.role);
    if (S.vid) localStorage.setItem("v_vid", S.vid);
  }

  async function rest(path, init) {
    var c = cfg();
    if (!c.supabaseUrl || !c.supabaseAnon)
      return { error: "Connect Supabase secrets in GitHub, then rebuild APK" };
    var url = c.supabaseUrl.replace(/\/$/, "") + "/rest/v1/" + path;
    try {
      var res = await fetch(url, Object.assign({}, init, {
        headers: Object.assign(
          {
            apikey: c.supabaseAnon,
            Authorization: "Bearer " + c.supabaseAnon,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          (init && init.headers) || {}
        ),
      }));
      if (!res.ok) return { error: await res.text() };
      if (res.status === 204) return { data: null };
      return { data: await res.json() };
    } catch (e) {
      return { error: e.message || "Network error" };
    }
  }

  async function assist(msg) {
    var key = cfg().geminiKey;
    if (!key) {
      return msg
        ? 'Understood: "' + msg + '". Add quantity and your price, then post to the network.'
        : "Welcome to Vimbiso. How can I assist you today? Tell me what you need.";
    }
    try {
      var res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
          encodeURIComponent(key),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text:
                      "You are Vimbiso for Zimbabwe informal trade. Short reply (1-2 sentences). No fake traders. User: " +
                      (msg || "opened app"),
                  },
                ],
              },
            ],
            generationConfig: { maxOutputTokens: 100 },
          }),
        }
      );
      var data = await res.json();
      var t =
        (data.candidates &&
          data.candidates[0] &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts.map(function (p) {
            return p.text || "";
          }).join("")) ||
        "";
      return t.trim() || "Tell me what you need.";
    } catch (e) {
      return "Type what you need — AI offline right now.";
    }
  }

  function go(screen) {
    S.screen = screen;
    draw();
  }

  function nav() {
    return (
      '<div class="nav">' +
      '<button class="' + (S.screen === "home" ? "on" : "") + '" data-go="home">Home</button>' +
      '<button class="' + (S.screen === "bid" ? "on" : "") + '" data-go="bid">Bid</button>' +
      '<button class="' + (S.screen === "trade" ? "on" : "") + '" data-go="trade">Trade</button>' +
      '<button class="' + (S.screen === "offers" ? "on" : "") + '" data-go="offers">Offers</button>' +
      '<button class="' + (S.screen === "profile" ? "on" : "") + '" data-go="profile">Profile</button>' +
      "</div>"
    );
  }

  function itemLabel(items) {
    try {
      if (Array.isArray(items) && items[0] && items[0].name) return items[0].name;
    } catch (e) {}
    return "Open request";
  }

  async function draw() {
    var el = document.getElementById("app");
    var h = "";

    if (S.screen === "welcome") {
      h =
        '<div class="screen">' +
        '<div class="bg" style="background-image:linear-gradient(160deg,#0a1628,#0f766e 55%,#0a1628)"></div>' +
        '<div class="content">' +
        '<div class="logo">VIMBISO NETWORK</div>' +
        '<div class="h1">Trade in real time.</div>' +
        '<p class="sub">Search what you need. Real traders respond. No fake catalogue browsing.</p>' +
        '<div class="stats"><div class="stat"><b>Live</b><span>Network</span></div>' +
        '<div class="stat"><b>ZW</b><span>Markets</span></div>' +
        '<div class="stat"><b>Real</b><span>IDs only</span></div></div>' +
        '<div class="spacer"></div>' +
        '<button class="btn btn-gold" data-go="signin">Get started</button>' +
        '<button class="btn btn-outline" data-go="signin">I already have an account</button>' +
        "</div></div>";
    } else if (S.screen === "signin") {
      h =
        '<div class="screen dark">' +
        '<div class="bg" style="background:linear-gradient(180deg,#0a1628,#143a5e)"></div>' +
        '<div class="content">' +
        '<button class="back" data-go="welcome">←</button>' +
        '<div class="h1" style="font-size:26px">Join the network</div>' +
        '<p class="sub">Your phone is your identity. Admin approves new accounts.</p>' +
        "<label>Full name</label><input id='name' value='" + esc(S.name) + "' />" +
        "<label>Phone</label><input id='phone' value='" + esc(S.phone) + "' placeholder='+263 7…' />" +
        "<label>City</label><input id='city' value='" + esc(S.city) + "' />" +
        "<label>I am a</label><select id='role'><option value='buyer'" +
        (S.role === "buyer" ? " selected" : "") +
        ">Buyer</option><option value='trader'" +
        (S.role === "trader" ? " selected" : "") +
        ">Trader</option><option value='both'" +
        (S.role === "both" ? " selected" : "") +
        ">Both</option></select>" +
        '<button class="btn btn-gold" id="reg">Continue</button>' +
        "</div></div>";
    } else if (S.screen === "home") {
      if (!S.ai) S.ai = "…";
      h =
        '<div class="screen" style="padding-bottom:72px">' +
        '<div class="bg" style="background:linear-gradient(165deg,#0a1628 0%,#0f766e 100%)"></div>' +
        '<div class="content">' +
        '<div class="top"><div class="logo">VIMBISO</div><span class="badge">' +
        esc(S.status) +
        "</span></div>" +
        '<div class="h1" style="font-size:24px">Hi' +
        (S.name ? ", " + esc(S.name.split(" ")[0]) : "") +
        "</div>" +
        '<div class="card-dark" style="border-radius:16px;padding:14px;margin:8px 0">' +
        '<div style="font-size:12px;opacity:.7;margin-bottom:6px">Assistant</div>' +
        "<div id='aiText'>" +
        esc(S.ai) +
        "</div></div>" +
        "<label style='color:rgba(255,255,255,.7)'>What do you need?</label>" +
        "<input id='need' placeholder='e.g. tomatoes 20kg, Chitungwiza' value='" +
        esc(S.need) +
        "' />" +
        '<button class="btn btn-gold" id="ask">Ask assistant</button>' +
        '<button class="btn btn-teal" id="toBid">Build bid & find traders</button>' +
        (S.status === "pending"
          ? '<p class="sub" style="margin-top:12px">Account pending approval — you can still explore.</p>'
          : "") +
        nav() +
        "</div></div>";
      assist("").then(function (t) {
        S.ai = t;
        var n = document.getElementById("aiText");
        if (n) n.textContent = t;
      });
    } else if (S.screen === "bid") {
      h =
        '<div class="screen" style="padding-bottom:72px;background:#f4f1ea">' +
        '<div class="content">' +
        '<div class="top"><button class="back" data-go="home">←</button><b>Build your bid</b><span></span></div>' +
        "<label>Item</label><input id='need' value='" + esc(S.need) + "' placeholder='Tomatoes' />" +
        "<label>Quantity</label><input id='qty' value='" + esc(S.qty) + "' />" +
        "<label>Your bid price (USD)</label><input id='price' type='number' value='" + esc(S.price) + "' placeholder='15' />" +
        '<button class="btn btn-teal" id="postBid">Post bid to network</button>' +
        '<p class="muted">Traders see this live. No fake listings.</p>' +
        nav() +
        "</div></div>";
    } else if (S.screen === "trade") {
      h =
        '<div class="screen" style="padding-bottom:72px;background:#f4f1ea">' +
        '<div class="content">' +
        '<div class="top"><button class="back" data-go="home">←</button><b>Trader desk</b><span class="badge">Live</span></div>' +
        '<div class="card"><b>Open buyer requests</b><p class="muted">Tap a request to send your live offer</p></div>' +
        '<div id="bidlist"><p class="muted">Loading…</p></div>' +
        nav() +
        "</div></div>";
      setTimeout(loadBidsUI, 0);
    } else if (S.screen === "offers") {
      h =
        '<div class="screen" style="padding-bottom:72px;background:#f4f1ea">' +
        '<div class="content">' +
        '<div class="top"><button class="back" data-go="home">←</button><b>Live offers</b><span class="badge">Network</span></div>' +
        '<div class="card" style="background:#0e2a47;color:#fff"><div style="opacity:.7;font-size:12px">Your need</div><b>' +
        esc(S.need || "Open requests") +
        "</b></div>" +
        '<div id="olist"><p class="muted">Watching network…</p></div>' +
        nav() +
        "</div></div>";
      setTimeout(loadOffersUI, 0);
    } else if (S.screen === "profile") {
      h =
        '<div class="screen" style="padding-bottom:72px;background:#f4f1ea">' +
        '<div class="content">' +
        '<div class="top"><button class="back" data-go="home">←</button><b>Profile</b><span></span></div>' +
        '<div class="card"><div class="logo" style="color:#0f766e">VIMBISO ID</div>' +
        '<div style="font-size:22px;font-weight:900;margin:8px 0">' +
        esc(S.vid || "Issued after signup") +
        "</div><b>" +
        esc(S.name || "—") +
        "</b><br/><span class='muted'>" +
        esc(S.phone) +
        " · " +
        esc(S.city) +
        '</span><br/><span class="badge' +
        (S.status === "approved" ? "" : " badge-warn") +
        '">' +
        esc(S.status) +
        "</span></div>" +
        '<button class="btn btn-ghost" id="out">Sign out</button>' +
        nav() +
        "</div></div>";
    }

    el.innerHTML = h + (S.toast ? '<div class="toast">' + esc(S.toast) + "</div>" : "");
    bind();
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function bind() {
    document.querySelectorAll("[data-go]").forEach(function (b) {
      b.onclick = function () {
        go(b.getAttribute("data-go"));
      };
    });
    var reg = document.getElementById("reg");
    if (reg)
      reg.onclick = async function () {
        S.name = document.getElementById("name").value.trim();
        S.phone = document.getElementById("phone").value.trim();
        S.city = document.getElementById("city").value.trim() || "Harare";
        S.role = document.getElementById("role").value;
        if (!S.name || !S.phone) return toast("Name and phone required");
        var roles =
          S.role === "both" ? ["buyer", "trader"] : S.role === "trader" ? ["trader"] : ["buyer"];
        var r = await rest("users", {
          method: "POST",
          body: JSON.stringify({
            phone: S.phone,
            name: S.name,
            city: S.city,
            roles: roles,
            status: "pending",
          }),
        });
        if (r.error) {
          if (String(r.error).indexOf("23505") >= 0 || String(r.error).indexOf("phone") >= 0) {
            var f = await rest("users?phone=eq." + encodeURIComponent(S.phone) + "&select=*");
            if (f.data && f.data[0]) {
              saveUser(f.data[0]);
              toast("Welcome back");
              go("home");
              return;
            }
          }
          return toast(String(r.error).slice(0, 90));
        }
        if (r.data && r.data[0]) {
          saveUser(r.data[0]);
          toast("Registered — pending approval");
          go("home");
        }
      };
    var ask = document.getElementById("ask");
    if (ask)
      ask.onclick = async function () {
        S.need = document.getElementById("need").value;
        var t = await assist(S.need);
        S.ai = t;
        var n = document.getElementById("aiText");
        if (n) n.textContent = t;
      };
    var toBid = document.getElementById("toBid");
    if (toBid)
      toBid.onclick = function () {
        var n = document.getElementById("need");
        if (n) S.need = n.value;
        go("bid");
      };
    var postBid = document.getElementById("postBid");
    if (postBid)
      postBid.onclick = async function () {
        S.need = document.getElementById("need").value;
        S.qty = document.getElementById("qty").value;
        S.price = document.getElementById("price").value;
        if (!S.userId) return toast("Sign in first");
        if (!S.need) return toast("Enter an item");
        var r = await rest("bids", {
          method: "POST",
          body: JSON.stringify({
            buyer_id: S.userId,
            items: [
              {
                name: S.need,
                qty: parseFloat(S.qty) || 1,
                unit: "kg",
                price: parseFloat(S.price) || 0,
              },
            ],
            city: S.city,
            status: "open",
          }),
        });
        if (r.error) return toast(String(r.error).slice(0, 90));
        toast("Bid live on the network");
        go("offers");
      };
    var out = document.getElementById("out");
    if (out)
      out.onclick = function () {
        localStorage.clear();
        S.userId = "";
        S.name = "";
        go("welcome");
      };
  }

  async function loadBidsUI() {
    var r = await rest("bids?status=eq.open&select=*&order=created_at.desc&limit=40");
    var box = document.getElementById("bidlist");
    if (!box) return;
    if (r.error) {
      box.innerHTML = '<div class="card muted">' + esc(String(r.error).slice(0, 100)) + "</div>";
      return;
    }
    S.bids = r.data || [];
    if (!S.bids.length) {
      box.innerHTML = '<div class="card muted">No open bids yet. When buyers post, they appear here.</div>';
      return;
    }
    box.innerHTML = S.bids
      .map(function (b) {
        return (
          '<button class="list-item" data-bid="' +
          b.id +
          '"><b>' +
          esc(itemLabel(b.items)) +
          "</b><br/><span class='muted'>" +
          esc(b.city || "") +
          " · " +
          new Date(b.created_at).toLocaleString() +
          "</span></button>"
        );
      })
      .join("");
    box.querySelectorAll("[data-bid]").forEach(function (btn) {
      btn.onclick = function () {
        sendOffer(btn.getAttribute("data-bid"));
      };
    });
  }

  async function sendOffer(bidId) {
    if (!S.userId) return toast("Sign in as trader");
    var price = prompt("Your offer price (USD)");
    if (!price) return;
    var r = await rest("offers", {
      method: "POST",
      body: JSON.stringify({
        trader_id: S.userId,
        bid_id: bidId,
        price: parseFloat(price),
        status: "active",
        fulfillment: "delivery",
        quality: "standard",
      }),
    });
    if (r.error) return toast(String(r.error).slice(0, 90));
    toast("Live offer sent to buyer");
  }

  async function loadOffersUI() {
    var r = await rest("offers?status=eq.active&select=*&order=created_at.desc&limit=40");
    var box = document.getElementById("olist");
    if (!box) return;
    if (r.error) {
      box.innerHTML = '<div class="card muted">' + esc(String(r.error).slice(0, 100)) + "</div>";
      return;
    }
    S.offers = r.data || [];
    if (!S.offers.length) {
      box.innerHTML =
        '<div class="card muted">Waiting for traders… Stay on this screen. Offers appear when sent.</div>';
      return;
    }
    box.innerHTML = S.offers
      .map(function (o) {
        return (
          '<div class="card"><div class="price">$' +
          Number(o.price).toFixed(2) +
          '</div><span class="muted">' +
          esc(o.fulfillment || "delivery") +
          " · " +
          esc(o.quality || "") +
          "</span></div>"
        );
      })
      .join("");
  }

  draw();
})();
