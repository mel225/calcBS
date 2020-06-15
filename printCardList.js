
function CardListExOnloadFunction(w, CardList){
  console.log(this);
  var d = w.document;

  // header 設定
  setHeader(d);

  // viewport 設定
  setViewport(w, d);

  // css 追加
  var ss = d.head.appendChild(d.createElement("link"));
  ss.rel = "stylesheet";
  ss.href = "http://localhost/card_list.css";

  // 全体のラッパー
  var wrapper = d.body.appendChild(d.createElement("div"));
  wrapper.className = "wrapper";
  // 検索ボックス(search box)
  var sbox = wrapper.appendChild(d.createElement("div"));
  // 一覧表示ボックス(list box)
  var lbox = wrapper.appendChild(d.createElement("div"));
  // 背景用ボックス
  var bg = d.body.appendChild(d.createElement("div"));

  //------ 検索ボックスの設定
  sbox.className = "searchbox";
  var stable = sbox.appendChild(d.createElement("table"));
  stable.className = "searchtable";

  /*
  // 作品名
  var r = stable.insertRow();
  r.insertCell().appendChild(d.createElement("span")).innerText = "作品名";
  r.insertCell().appendChild(d.createElement("select")).id = "ip";
  setIpBox(d);
    */
  
  // フィルター
  r = stable.insertRow();
  r.insertCell().appendChild(d.createElement("span")).innerText = "フィルター";
  r.insertCell().appendChild(d.createElement("div")).id = "filter";
  setFilterBox(d, CardList);
  
  // ソート
  r = stable.insertRow();
  r.insertCell().appendChild(d.createElement("span")).innerText = "ソート";
  r.insertCell().appendChild(d.createElement("div")).id = "sort";
  setSortBox(d);
  
  // 並び順と決定ボタン
  /*
  r = stable.insertRow();
  r.insertCell().rowSpan = 7;
  r.insertCell().appendChild(d.createElement("div")).id = "submit";
    */

  //------ 一覧表示ボックス
  var ltable = lbox.appendChild(d.createElement("table"));
  ltable.id = "listtable";
  // 今後はsublistをもとに展開
  window.sublist = CardList;
  printList(d, CardList);

  //------ 背景用ボックス
  bg.className = "background_panel";
  CardList.forEach(function(card){
    bg.appendChild(d.createElement("img")).src = card.imgURL;
  });
}

// sublist を ltable に展開
function printList(d, list){
  var table = d.getElementById("listtable");
  list.forEach(card=>{
    printCard(table.insertRow(), card);
  });

  // カード情報を１行に収めて表示
  function printCard(r, card){
    // 画像とカード情報ページ（登録時に取得したページ）へのリンク
    var td = r.insertCell();
    var a = td.appendChild(d.createElement("a"));
    //a.href = card.url;
    a.onclick = function(){
      var w = window.open();
      var d = w.document;
      setHeader(d);
      setViewport(w, d);
      var ss = d.head.appendChild(d.createElement("link"));
      ss.rel = "stylesheet";
      ss.href = "https://ongeki-net.com/ongeki-mobile/css/common.css?ver=1.15.0";
      d.body.innerHTML = card.document;
    };
    a.className = "link_detail";
    var img = a.appendChild(d.createElement("img"));
    img.className = "img_card";
    img.width = 0;
    img.height = 0;
    img.src = card.imgURL;
    img.title = card.name;

    // 属性
    td = r.insertCell();
    img = td.appendChild(d.createElement("img"));
    img.className = "icon_attribute";
    img.width = 0;
    img.height = 0;
    img.src = card.attributeIcon;

    // レアリティ
    td = r.insertCell();
    img = td.appendChild(d.createElement("img"));
    img.className = "icon_rarity";
    img.width = 0;
    img.height = 0;
    img.src = card.rarityIcon;

    // 解花アイコン
    td = r.insertCell();
    img = td.appendChild(d.createElement("img"));
    img.className = "icon_kaika";
    img.width = 0;
    img.height = 0;
    img.src = card.kaikaIcon;

    // キャラ名と副題
    td = r.insertCell();
    var span = td.appendChild(d.createElement("span"));
    span.innerText = card.character;
    span.className = "span_bolder";
    td.appendChild(d.createElement("br"));
    span = td.appendChild(d.createElement("span"));
    span.className = "minispan";
    span.innerText = (hoge = card.name.split("[")[1]) ? "[" + hoge : "";

    // レベル／最大レベル
    td = r.insertCell();
    var span = td.appendChild(d.createElement("span"));
    span.innerText = card.levelNum + " ";
    span.className = "span_bolder";
    td.appendChild(d.createElement("br"));
    span = td.appendChild(d.createElement("span"));
    span.className = "minispan";
    span.innerText = "/ " + card.levelMax;

    // 攻撃力／最大攻撃力
    td = r.insertCell();
    span = td.appendChild(d.createElement("span"));
    span.innerText = card.powerNum + " ";
    span.className = "span_bolder";
    td.appendChild(d.createElement("br"));
    span = td.appendChild(d.createElement("span"));
    span.className = "minispan";
    span.innerText = "/ " + card.powerMax;

    // スキルアイコン
    td = r.insertCell();
    img = td.appendChild(d.createElement("img"));
    img.className = "icon_skill";
    img.width = 0;
    img.height = 0;
    img.src = card.skillIcon;

    // 見せるかどうか
    r.style.display = card.display;
    // ソート時の参照のため
    r.card = card;
  }
}

// バージョン選択
function setIpBox(d){
  xhra.access("https://ongeki-net.com/ongeki-mobile/card/cardList/").then(doc=>{
    Array.from(doc.getElementsByTagName("select")).forEach(select=>{
      if(select.name == "ip"){
        d.getElementById("ip").innerHTML = select.innerHTML;
      }
    });
  });
}

// フィルターボックスの設定
function setFilterBox(d, list){
  xhra.access("https://ongeki-net.com/ongeki-mobile/card/cardList/").then(doc=>{
    var filter = d.getElementById("filter");

    // キャラクター
    var characters = [];
    list.forEach(card => {
      if(characters.indexOf(card.character) < 0){
        characters.push(card.character);
      }
    });
    addCategory(filter, "character", "キャラクター", characters.map(function(ch){return {text: ch};}));

    // レアリティ
    var elements = ["n", "r", "sr", "srp", "ssr"].map(rare=>{
      return {img: "https://ongeki-net.com/ongeki-mobile/img/card_icon_" + rare + ".png"};
    });
    addCategory(filter, "rarityIcon", "レアリティ", elements);

    // 属性
    var elements = ["fire", "aqua", "leaf"].map(prop=>{
      return {img: "https://ongeki-net.com/ongeki-mobile/img/card_icon_" + prop + ".png"};
    });
    addCategory(filter, "attributeIcon", "属性", elements);

    // スキルタイプ
    var elements = ["attack", "boost", "guard", "assist", "attack_d", "boost_d", "guard_d", "assist_d"].map(skill=>{
      return {img: "https://ongeki-net.com/ongeki-mobile/img/skill_" + skill + ".png"};
    });
    addCategory(filter, "skillIcon", "スキルタイプ", elements);

    // 解花
    var elements = ["mikaika", "kaika", "chokaika"].map(kaika=>{
      return {img: "https://ongeki-net.com/ongeki-mobile/img/card_icon_" + kaika + ".png"};
    });
    addCategory(filter, "kaikaIcon", "解花", elements);
  });

  function addCategory(parent, name, caption, elements){
    // カテゴリーを乗せる div の設定
    var cat = parent.appendChild(d.createElement("div"));
    cat.id = "filter_" + name + "_category";
    cat.className = "category";
    cat.onclick = hs_action;
    var catcb = parent.appendChild(d.createElement("input"));
    catcb.type = "checkbox";

    // カテゴリー名の表示と hide/show ボタンの設置
    var capdiv = cat.appendChild(d.createElement("div"));
    capdiv.className = "filter_caption";
    capdiv.appendChild(d.createElement("span")).innerText = caption;
    var hsbutton = capdiv.appendChild(d.createElement("label"));
    hsbutton.innerText = "show";
    hsbutton.className = "hsbutton";

    // カテゴリの要素の設定
    var elmdiv = cat.appendChild(d.createElement("div"));
    elmdiv.className = "filter_elements";
    elmdiv.id = "filter_" + name + "_element";
    elmdiv.name = name;
    elements.forEach(e => {
      addButton(elmdiv, e.text, e.img);
    });

    // hide/show 動作の設定
    function hs_action(){
      if(catcb.checked){ // 消すとき
        catcb.checked = false;
        hsbutton.innerText = "show";
        Array.from(elmdiv.getElementsByTagName("label")).forEach(e => {
          e.style.display = "";
        });
      }else{
        catcb.checked = true;
        hsbutton.innerText = "hide";
        Array.from(elmdiv.getElementsByTagName("label")).forEach(e => {
          e.style.display = "inline-block";
        });
      }
    }
  }

  function addButton(parentDiv, text, img){
    var checkbox = parentDiv.appendChild(d.createElement("input"));
    var label = parentDiv.appendChild(d.createElement("label"));
    // チェックボックスの設定
    checkbox.className = "filter_button";
    checkbox.type = "checkbox";
    checkbox.id = parentDiv.id + parentDiv.getElementsByTagName("checkbox").length;
    checkbox.value = text || img;
    // ラベルの設定
    label.className = "filter_label";
    if(img) label.appendChild(d.createElement("img")).src = img;
    else    label.innerText = text;
    label.onclick = function(){
      event.cancelBubble = true;
      checkbox.checked ^= true;
      doFilter();
    }
    return checkbox;
  }

  function doFilter(){
    var filters = {};
    Array.from(d.getElementsByClassName("filter_elements")).forEach(function(element){
      console.log("#fiter_" + element.name + " input:checked", d.querySelectorAll("#" + element.id + " input:checked"));
      filters[element.name] = Array.from(d.querySelectorAll("#" + element.id + " input:checked")).map(function(node){
        return node.value;
      });
    });
    Array.from(d.getElementById("listtable").rows).forEach(function(r){
      var visible = true;
      Object.keys(filters).forEach(function(categoryName){
        if(filters[categoryName].length){
          if(filters[categoryName].indexOf(r.card[categoryName]) >= 0){ // 選択されていれば
            visible &= true; // ほかのフィルターとの AND をとる
          }else{
            visible &= false;
          }
        }else{ // そもそもフィルターをかけていなければ
          visible &= true; // 他のフィルターを優先させる
        }
      });
      if(visible)
        r.style.display = "";
      else
        r.style.display = "none";
    });
  }
}

// ソートボックスの設定 同時にソート関数の設定
function setSortBox(d){
  // 大元の取得
  var sortdiv = d.getElementById("sort");
  sortdiv.methods = {};

  // Sortable を付与
  new Sortable(sortdiv, {
  animation: 150,
  onEnd: doSort
  });

  addSortMethod("ＭＡＸ攻撃力", function(a,b){
    return a.card.powerMax - b.card.powerMax;
  });

  addSortMethod("攻撃力", function(a,b){
    return a.card.powerNum - b.card.powerNum;
  });

  addSortMethod("カードＬｖ", function(a,b){
    return a.card.levelNum - b.card.levelNum;
  });

  addSortMethod("ＭＡＸカードＬｖ", function(a,b){
    return a.card.levelMax - b.card.levelMax;
  });

  addSortMethod("レアリティ", function(a,b){
    var rarity = ["n", "r", "sr", "srp", "ssr"];
    return rarity.indexOf(a.card.rarityIcon.split("icon_")[1].split(".png")[0]) - rarity.indexOf(b.card.rarityIcon.split("icon_")[1].split(".png")[0]);
  });

  addSortMethod("限界突破回数", function(a,b){
    return a.card.gentotsuNum - b.card.gentotsuNum;
  });

  addSortMethod("ＭＡＸ限界突破回数", function(a,b){
    return a.card.gentotsuMax - b.card.gentotsuMax;
  });

  function addSortMethod(caption, compareFunction){
    sortdiv.methods[caption] = {func: compareFunction, enabled: false};
    var div = sortdiv.appendChild(d.createElement("div"));
    div.className = "sort_item";
    div.innerText = caption;
    div.compareFunction = compareFunction;
    div.style.textDecoration = "line-through";
    div.style.background = "#888c";
    var cb = div.appendChild(d.createElement("input"));
    cb.type = "checkbox";
    cb.checked = false;
    cb.style.display = "none";
    div.onclick = function(){
      cb.checked ^= true;
      sortdiv.methods[caption].enabled = cb.checked;
      for(var i=0; i<sortdiv.children.length; i++){
        if(sortdiv.children[i] === div)
          continue;
        if(!sortdiv.children[i].firstElementChild.checked)
          break;
      }
      sortdiv.insertBefore(div, sortdiv.children[i]);
      doSort();
      if(cb.checked){
        div.style.textDecoration = "";
        div.style.background = "";
      }else{
        div.style.textDecoration = "line-through";
        div.style.background = "#888c";
      }
    }
  }
  
  function doSort(){
    Array.from(d.getElementById("listtable").rows).sort(function(a,b){
      var methods = Object.values(sortdiv.children).map(function(child){return sortdiv.methods[child.innerText];});
      for(var i=0; i<methods.length; i++){
        if(methods[i].enabled){
          var result = methods[i].func(a,b);
          if(result != 0)
            return result;
        }
      }
      return 0;
    }).forEach(function(card){
      card.parentNode.appendChild(card);
    });
  }
}