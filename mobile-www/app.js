(function(){
var cfg=function(){return window.VIMBISO_CFG||{};};
var S={screen:localStorage.getItem("v_uid")?"home":"welcome",phone:localStorage.getItem("v_phone")||"",name:localStorage.getItem("v_name")||"",city:localStorage.getItem("v_city")||"Harare",userId:localStorage.getItem("v_uid")||"",status:localStorage.getItem("v_status")||"pending",role:localStorage.getItem("v_role")||"buyer",need:"",toast:""};
function toast(m){S.toast=m;draw();setTimeout(function(){S.toast="";draw();},2500);}
function go(s){S.screen=s;draw();}
async function rest(path,init){
  var c=cfg();
  if(!c.supabaseUrl||!c.supabaseAnon)return{error:"Set Supabase secrets on GitHub, rebuild APK"};
  try{
    var res=await fetch(c.supabaseUrl.replace(/\/$/,"")+"/rest/v1/"+path,Object.assign({},init,{headers:Object.assign({apikey:c.supabaseAnon,Authorization:"Bearer "+c.supabaseAnon,"Content-Type":"application/json",Prefer:"return=representation"},(init&&init.headers)||{})}));
    if(!res.ok)return{error:await res.text()};
    if(res.status===204)return{data:null};
    return{data:await res.json()};
  }catch(e){return{error:e.message||"Network error"};}
}
function nav(){
  return '<div class="nav"><button class="'+(S.screen==="home"?"on":"")+'" data-go="home">Home</button><button class="'+(S.screen==="bid"?"on":"")+'" data-go="bid">Bid</button><button class="'+(S.screen==="trade"?"on":"")+'" data-go="trade">Trade</button><button class="'+(S.screen==="offers"?"on":"")+'" data-go="offers">Offers</button><button class="'+(S.screen==="profile"?"on":"")+'" data-go="profile">Profile</button></div>';
}
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");}
async function draw(){
  var el=document.getElementById("app"),h="";
  if(S.screen==="welcome"){
    h='<div class="screen"><div class="hero"><div style="opacity:.8;font-size:12px;font-weight:800">VIMBISO NETWORK</div><h1>Trade in real time.</h1><p>Search what you need. Real traders respond.</p></div><button class="btn btn-gold" data-go="signin">Get started</button></div>';
  }else if(S.screen==="signin"){
    h='<div class="screen"><button data-go="welcome">Back</button><h2>Join / Sign in</h2><label>Name</label><input id="name" value="'+esc(S.name)+'"/><label>Phone</label><input id="phone" value="'+esc(S.phone)+'" placeholder="+263..."/><label>City</label><input id="city" value="'+esc(S.city)+'"/><label>Role</label><select id="role"><option value="buyer">Buyer</option><option value="trader">Trader</option></select><button class="btn btn-teal" id="reg">Continue</button></div>';
  }else if(S.screen==="home"){
    h='<div class="screen" style="padding-bottom:70px"><div class="hero"><h1>Hi'+(S.name?", "+esc(S.name.split(" ")[0]):"")+'</h1><p>What do you need today?</p></div><label>Need</label><input id="need" value="'+esc(S.need)+'" placeholder="e.g. tomatoes 20kg"/><button class="btn btn-gold" id="toBid">Build bid</button><p class="muted">Status: <span class="badge">'+esc(S.status)+'</span></p>'+nav()+'</div>';
  }else if(S.screen==="bid"){
    h='<div class="screen" style="padding-bottom:70px"><h2>Post a bid</h2><label>Item</label><input id="need" value="'+esc(S.need)+'"/><label>Price USD</label><input id="price" type="number" placeholder="15"/><button class="btn btn-teal" id="post">Post to network</button>'+nav()+'</div>';
  }else if(S.screen==="trade"){
    h='<div class="screen" style="padding-bottom:70px"><h2>Open requests</h2><div id="list"><p class="muted">Loading…</p></div>'+nav()+'</div>';
    setTimeout(loadBids,0);
  }else if(S.screen==="offers"){
    h='<div class="screen" style="padding-bottom:70px"><h2>Live offers</h2><div id="olist"><p class="muted">Loading…</p></div>'+nav()+'</div>';
    setTimeout(loadOffers,0);
  }else if(S.screen==="profile"){
    h='<div class="screen" style="padding-bottom:70px"><h2>Profile</h2><div class="card"><b>'+esc(S.name||"—")+'</b><br/>'+esc(S.phone)+'<br/>'+esc(S.city)+'<br/><span class="badge">'+esc(S.status)+'</span></div><button class="btn" id="out" style="background:#eee">Sign out</button>'+nav()+'</div>';
  }
  el.innerHTML=h+(S.toast?'<div class="toast">'+esc(S.toast)+'</div>':'');
  document.querySelectorAll("[data-go]").forEach(function(b){b.onclick=function(){go(b.getAttribute("data-go"));};});
  var reg=document.getElementById("reg");
  if(reg)reg.onclick=async function(){
    S.name=document.getElementById("name").value.trim();
    S.phone=document.getElementById("phone").value.trim();
    S.city=document.getElementById("city").value.trim()||"Harare";
    S.role=document.getElementById("role").value;
    if(!S.name||!S.phone)return toast("Name and phone required");
    var r=await rest("users",{method:"POST",body:JSON.stringify({phone:S.phone,name:S.name,city:S.city,roles:[S.role],status:"pending"})});
    if(r.error&&(String(r.error).indexOf("23505")>=0||String(r.error).indexOf("phone")>=0)){
      var f=await rest("users?phone=eq."+encodeURIComponent(S.phone)+"&select=*");
      if(f.data&&f.data[0]){save(f.data[0]);toast("Welcome back");go("home");return;}
    }
    if(r.error)return toast(String(r.error).slice(0,80));
    if(r.data&&r.data[0]){save(r.data[0]);toast("Registered");go("home");}
  };
  var toBid=document.getElementById("toBid");
  if(toBid)toBid.onclick=function(){var n=document.getElementById("need");if(n)S.need=n.value;go("bid");};
  var post=document.getElementById("post");
  if(post)post.onclick=async function(){
    S.need=document.getElementById("need").value;
    var price=document.getElementById("price").value;
    if(!S.userId)return toast("Sign in first");
    var r=await rest("bids",{method:"POST",body:JSON.stringify({buyer_id:S.userId,items:[{name:S.need,price:parseFloat(price)||0}],city:S.city,status:"open"})});
    if(r.error)return toast(String(r.error).slice(0,80));
    toast("Bid posted");go("offers");
  };
  var out=document.getElementById("out");
  if(out)out.onclick=function(){localStorage.clear();S.userId="";go("welcome");};
}
function save(u){
  S.userId=u.id;S.name=u.name||S.name;S.status=u.status||"pending";
  localStorage.setItem("v_uid",S.userId);localStorage.setItem("v_name",S.name);localStorage.setItem("v_phone",S.phone);localStorage.setItem("v_city",S.city);localStorage.setItem("v_status",S.status);localStorage.setItem("v_role",S.role);
}
async function loadBids(){
  var box=document.getElementById("list");if(!box)return;
  var r=await rest("bids?status=eq.open&select=*&order=created_at.desc&limit=30");
  if(r.error){box.innerHTML='<p class="muted">'+esc(String(r.error).slice(0,80))+'</p>';return;}
  var rows=r.data||[];
  if(!rows.length){box.innerHTML='<div class="card muted">No open bids yet</div>';return;}
  box.innerHTML=rows.map(function(b){
    var name="Request";try{if(b.items&&b.items[0]&&b.items[0].name)name=b.items[0].name;}catch(e){}
    return '<button class="card" style="width:100%;text-align:left;border:1px solid #eee" data-bid="'+b.id+'"><b>'+esc(name)+'</b><br/><span class="muted">'+esc(b.city||"")+'</span></button>';
  }).join("");
  box.querySelectorAll("[data-bid]").forEach(function(btn){
    btn.onclick=async function(){
      if(!S.userId)return toast("Sign in as trader");
      var price=prompt("Your offer price USD");if(!price)return;
      var r=await rest("offers",{method:"POST",body:JSON.stringify({trader_id:S.userId,bid_id:btn.getAttribute("data-bid"),price:parseFloat(price),status:"active",fulfillment:"delivery"})});
      if(r.error)return toast(String(r.error).slice(0,80));
      toast("Offer sent");
    };
  });
}
async function loadOffers(){
  var box=document.getElementById("olist");if(!box)return;
  var r=await rest("offers?status=eq.active&select=*&order=created_at.desc&limit=30");
  if(r.error){box.innerHTML='<p class="muted">'+esc(String(r.error).slice(0,80))+'</p>';return;}
  var rows=r.data||[];
  if(!rows.length){box.innerHTML='<div class="card muted">No offers yet</div>';return;}
  box.innerHTML=rows.map(function(o){return '<div class="card"><b>$'+Number(o.price).toFixed(2)+'</b></div>';}).join("");
}
draw();
})();
