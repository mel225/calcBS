if(document.getElementById("xhrReader")){
  xhra.reset();
  main();
}else{
  var s = document.createElement("script");
  s.src = "https://mel225.github.io/calcBS/xhrAccesser.js";
  s.id = "xhrReader";
  s.onload = main;
  document.head.appendChild(s);
}

async function main(){
  var date = new Date();
  var CardList;
  if(localStorage["mel225_CardList"] !== undefined){
    if(confirm("新規にデータを取得する場合は【はい】、以前のデータ(" + localStorage["mel225_getCardList_date"] + ")を使用する場合は【いいえ】を選択してね。")){
      CardList = await getCardList().then(cards => {
        return cards;
      });
      localStorage["mel225_CardList"] = JSON.stringify(CardList);
      localStorage["mel225_getCardList_date"] = date.getFullYear() + "年 " (date.getMonth()+1) + "月 " + date.getDate();
    }else{
      CardList = JSON.parse(localStorage["mel225_CardList"]);
    }
  }else{
    CardList = await getCardList().then(cards => {
      return cards;
    });
    localStorage["mel225_CardList"] = JSON.stringify(CardList);
    localStorage["mel225_getCardList_date"] = date.getFullYear() + "年 " (date.getMonth()+1) + "月 " + date.getDate();
  }
    
  console.log(CardList);

  // 表示用タブopen
  var w = window.open();
  var d = w.document;
  // 検索ボックス(search box)
  var sbox = d.body.appendChild(d.createElement("div"));
  // 一覧表示ボックス(list box)
  var lbox = d.body.appendChild(d.createElement("div"));

  //------ 検索ボックスの設定
  sbox.className = "searchbox";
  var stable = sbox.appendChild(d.createElement("table"));
  stable.className = "searchtable";
  
  // 作品名
  var r = stable.insertRow();
  r.insertCell().appendChild(d.createElement("span")).innerText = "作品名";
  r.insertCell().appendChild(d.createElement("select")).id = "ip";
  setIpBox(d);
  
  // フィルター
  r = stable.insertRow();
  r.insertCell().appendChild(d.createElement("span")).innerText = "フィルター";
  r.insertCell().appendChild(d.createElement("div")).id = "filter";
  setFilterBox(d, CardList);
  
  // ソート
  r = stable.insertRow();
  r.insertCell().appendChild(d.createElement("span")).innerText = "ソート";
  r.insertCell().appendChild(d.createElement("select")).id = "sort";
  setSortBox(d);
  
  // 並び順と決定ボタン
  r = stable.insertRow();
  r.insertCell();
  r.insertCell().appendChild(d.createElement("div")).id = "submit";

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
    var elements = [];
    list.forEach(card => {
      if(characters.indexOf(card.character) < 0){
        characters.push(card.character);
        elements.push({caption: card.character});
      }
    });
    addCategory("character", "キャラクター", elements);

    // レアリティ
    var elements = ["n", "r", "sr", "srp", "ssr"].map(rare=>{
      var img = d.createElement("img");
      img.src = "https://ongeki-net.com/ongeki-mobile/img/card_icon_" + rare + ".png";
      return {img: img};
    });
    addCategory("rarety", "レアリティ", elements);

    // 属性
    var elements = ["fire", "aqua", "leaf"].map(prop=>{
      var img = d.createElement("img");
      img.src = "https://ongeki-net.com/ongeki-mobile/img/card_icon_" + prop + ".png";
      return {img: img};
    });
    addCategory("property", "属性", elements);

    // スキルタイプ
    var elements = ["attack", "boost", "guard", "assist", "attack_d", "boost_d", "guard_d", "assist_d"].map(skill=>{
      var img = d.createElement("img");
      img.src = "https://ongeki-net.com/ongeki-mobile/img/skill_" + skill + ".png";
      return {img: img};
    });
    addCategory("skilltype", "スキルタイプ", elements);

    // 解花
    var elements = ["mikaika", "kaika", "chokaika"].map(kaika=>{
      var img = d.createElement("img");
      img.src = "https://ongeki-net.com/ongeki-mobile/img/card_icon_" + kaika + ".png";
      return {img: img};
    });
  });

  function addCategory(name, caption, elements){
    // カテゴリーを乗せる div の設定
    var cat = filter.appendChild(d.createElement("div"));
    cat.id = "filter_" + name;
    cat.onclick = hs_action;
    var catcb = cat.appendChild(d.createElement("input"));
    catcb.type = "checkbox";
    catcb.style.block = "none";

    // カテゴリー名の表示と hide/show ボタンの設置
    var capdiv = cat.appendChild(d.createElement("div"));
    capdiv.className = "filter_caption";
    capdiv.appendChild(d.createElement("span")).innerText = caption;
    var hsbutton = capdiv.appendChild(d.createElement("div"));
    hsbutton.className = "hsbutton";
    hsbutton.onclick = hs_action;
    // 改行
    cat.appendChild(d.createElement("br"));

    // カテゴリの要素の設定
    var elmdiv = cat.appendChild(d.createElement("div"));
    elmdiv.className = "filter_elements";
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
          e.style.display = "block";
        });
      }
    }
  }

  function addButton(parentDiv, text, img){
    var checkbox = parentDiv.appendChild(d.createElement("checkbox"));
    var label = checkbox.appendChild(d.createElement("label"));
    // チェックボックスの設定
    checkbox.className = "filter_button";
    checkbox.id = parentDiv.id + parentDiv.getElementsByTagName("checkbox").length;
    checkbox.value = text;
    // ラベルの設定
    label.className = "filter_label";
    label.setAttribute("for", checkbox.id);
    if(img) label.appendChild(d.createElement("img")).src = img;
    else    label.innerText = text;

    return checkbox;
  }
}

  

function getCardDetail(CardNo, CardDetailDoc){
  return new Promise(resolve => {
    var CardDetail = {};
    CardDetail.cardNo = CardNo;
    CardDetail.imgURL = CardDetailDoc.getElementsByClassName("card_detail_img w_212")[0].src;
    var detail = CardDetailDoc.getElementsByClassName("card_detail_container f_l t_l")[0];
    CardDetail.attribute = detail.getElementsByClassName("h_50 f_0")[0].children[0].src.split("icon_")[1].split(".png")[0];
    CardDetail.rarity = detail.getElementsByClassName("h_50 f_0")[0].children[1].src.split("icon_")[1].split(".png")[0];
    CardDetail.gentotsuMax = detail.getElementsByClassName("card_detail_star_container v_b f_0")[0].children[0].children.length;
    CardDetail.gentotsuNum = detail.getElementsByClassName("card_detail_star_container v_b f_0")[0].children[1].children.length;
    CardDetail.kaikaIcon = (hoge = detail.getElementsByClassName("card_kaika")[0]) ? hoge.src : "https://ongeki-net.com/ongeki-mobile/img/card_icon_mikaika.png";
    CardDetail.name = detail.getElementsByClassName("p_t_5 f_14 l_h_12 break")[0].innerText;
    CardDetail.character = CardDetail.name.split("】")[1].split("[")[0];
    CardDetail.levelNum = parseInt(detail.getElementsByClassName("card_lv_block t_r f_0")[0].children[0].innerText);
    CardDetail.levelMax = parseInt(detail.getElementsByClassName("card_lv_block t_r f_0")[0].children[1].innerText.split("/")[1]);
    var detailTable = detail.getElementsByClassName("card_detail_param_block")[0].firstElementChild;
    var power = detailTable.rows[0].cells[1].innerText;
    CardDetail.powerNum = parseInt(power.split("/")[0]);
    CardDetail.powerMax = parseInt(power.split("/")[1]);
    CardDetail.printable = parseInt(detailTable.rows[1].cells[1].firstElementChild.innerText);
    CardDetail.ver = detailTable.rows[2].cells[1].innerText;
    CardDetail.skillIcon = detail.getElementsByClassName("card_skill_icon")[0].src;
    CardDetail.skillName = detail.getElementsByClassName("f_11 l_h_12 p_l_5")[0].innerText.trim();
    CardDetail.skillDetail = detail.getElementsByClassName("f_10 l_h_10 v_t break")[0].innerText.trim();
    CardDetail.how2get = CardDetailDoc.getElementsByClassName("card_detail_other_item")[0].innerText.split("\n");
    CardDetail.ticket = [];
    for(var i=1; hoge = CardDetailDoc.getElementsByClassName("card_detail_other_item")[i]; i++){
      CardDetail.ticket.push({rarity : hoge.innerText.split("【")[1].split("】")[0], name : hoge.innerText.trim().split("\n")[0].split("】")[1].trim(), num : parseInt(hoge.innerText.trim().split("\n")[1].split("枚")[0].trim())});
    }

    setTimeout(resolve, 5, CardDetail);
  });
}

function getCardList(){
  return new Promise(async resolve => {
    //------ カード一覧のすべてのページを取得する
    var url = "https://ongeki-net.com/ongeki-mobile/card/cardList/pages/?type=0&ipType=0&ip=all&search=0&sIdx=-1&sort=2&order=asc&pIdx=";
    // ページ数を取得
    var pages = xhra.access(url + 1).then(doc => {return doc.getElementById("pIdx").nextElementSibling.innerText.split("/")[1];});
    console.log("pages: " + await pages);
    // すべてのページのURLを生成 pIdx = pageIndex を 1-pages で URL 生成
    var PageURLs = [];
    for(var i=1; i<=await pages; i++){
      PageURLs.push(url + i);
    }
    // 処理を後ろに追加するためにタイムアウトに登録する形でresolve
    setTimeout(resolve, 1, PageURLs);
  }).then(PageURLs => {
    // すべてのページにアクセスする
    return Promise.all(PageURLs.map(url => {
      return xhra.access(url);
    }));
  }).then(PageDocs => {
    // ページ内のカードURLを取得する
    CardURLs = {};
    return new Promise(resolve => {
      PageDocs.forEach(doc => {
        Array.from(doc.getElementsByClassName("t_c border_block m_5 p_5")).forEach(item => {
          var cardNo = item.getElementsByClassName("t_c break f_11 l_h_12")[0].innerText.trim();
          var input = item.getElementsByTagName("input");
          var param = [];
          for(var j=0; j<input.length; j++){
            param.push(input[j].name + "=" + encodeURIComponent(input[j].value));
          }
          // URL とカード No. を返す
          CardURLs[cardNo] = "https://ongeki-net.com/ongeki-mobile/card/cardDetail/?" + param.join("&");
        });
      });
      setTimeout(resolve, 1, CardURLs);
    });
  }).then(CardURLampNo => {
    // すべてのカードURLにアクセスしてデータを得る
    return Promise.all(Object.keys(CardURLs).map(no => {
      return xhra.access(CardURLs[no]).then(doc => {
        return getCardDetail(no, doc);
      });
    }));
  });
}
