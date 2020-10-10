var modal = document.body.appendChild(document.createElement("div"));
modal.style.background = "#000C";
modal.style.position = "fixed";
modal.style.zIndex = 1000000;
modal.style.width = "100%";
modal.style.height = "100%";
modal.style.left = 0;
modal.style.top = 0;
var statusbox = modal.appendChild(document.createElement("div"));
statusbox.style.position = "absolute";
statusbox.style.margin = "auto";
statusbox.style.left = 0;
statusbox.style.right = 0;
statusbox.style.top = 0;
statusbox.style.bottom = 0;
statusbox.style.width = "80%";
statusbox.style.height = "80%";
statusbox.style.overflowY = "scroll";
statusbox.style.background = "url('https://ongeki-net.com/ongeki-mobile/img/back_base.png') repeat";

addStatus("Sorted Card List v0.5 by mel225 (twitter: casge_pzl)");

var pages = 0;
var cards = 0;
var loads = 0;
var cardcount = 0;
var list = [];

if(document.getElementById("xhrAccesser")){
  xhra.reset();
  main();
}else{
  var listJS = ["xhrAccesser", "Sortable.min", "printCardList"];
  Promise.all(listJS.map(getJS)).then(function(){
    main();
  });
}

async function oldmain(){
  var date = new Date();
  var CardList;
  if(localStorage["mel225_CardList"] !== undefined){
    if(confirm("新規にデータを取得する場合は【はい】、以前のデータ(" + localStorage["mel225_getCardList_date"] + ")を使用する場合は【いいえ】を選択してね。")){
      CardList = await getCardList().then(cards => {
        return cards;
      });
      localStorage["mel225_CardList"] = JSON.stringify(CardList);
      localStorage["mel225_getCardList_date"] = date.getFullYear() + "年 " + (date.getMonth()+1) + "月 " + date.getDate() + "日";
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
  CardListExOnloadFunction(window.open("about:blank"), CardList);
}

function main(){
  alert("カード一覧を取得します。");
  getCardList();
}

function checkOldData(){
  
}

async function getCardList(){
  //------ カード一覧のすべてのページを取得する
  var url = "https://ongeki-net.com/ongeki-mobile/card/cardList/pages/?type=0&ipType=0&ip=all&search=0&sIdx=-1&sort=2&order=asc&pIdx=";
  // ページ数を取得
  await xhra.access(url + 1).then(doc=>{pages = Number(doc.getElementById("pIdx").nextElementSibling.innerText.split("/")[1].trim())});
  console.log("pages: " + await pages);
  addStatus("カード一覧　ページ数：" + pages);
  // すべてのページのURLを生成しアクセス pIdx = pageIndex を 1-pages で URL 生成
  for(var i=1; i<=await pages; i++){
    toCardDetailURL(url, i);
  }
}

function toCardDetailURL(url, no){
  var count = 0;
  xhra.access(url + no).then(function(doc){
    addStatus("カード一覧　ページNo." + no + " 読込完了");
    Array.from(doc.getElementsByClassName("t_c border_block m_5 p_5")).forEach(item => {
      cardcount++;
      count++;
      var cardNo = item.getElementsByClassName("t_c break f_11 l_h_12")[0].innerText.trim();
      var input = item.getElementsByTagName("input");
      var param = [];
      for(var j=0; j<input.length; j++){
        param.push(input[j].name + "=" + encodeURIComponent(input[j].value));
      }
      // URL とカード No. でdetail取得
      getCardDetail(cardNo, "https://ongeki-net.com/ongeki-mobile/card/cardDetail/?" + param.join("&"));
      // ステータスウィンドウ用
      if(no == pages && doc.getElementsByClassName("t_c border_block m_5 p_5").length == count){
        cards = cardcount;
        addStatus("カード詳細 全" + cards + "カードのURL取得完了");
        addStatus("カード詳細 読込開始 0%");
        var prog = 1;
        var timerID = setInterval(function(){
          if(loads*20/cards >= prog){
            addStatus("カード詳細 読込中… " + prog*5 + "%");
            if(prog*step >= 20){
              clearInterval(timerID);
              console.log(list);
              addStatus("");
              addStatus("念のためlocalStorageにJSONを突っ込んでおきます。");
              localStorage["mel225_SCL"] = JSON.stringify(list);

              var closemodal = document.createElement("a");
              closemodal.innerText = "閉じる";
              closemodal.onclick = function(){
                modal.parentNode.removeChild(modal);
              };
              closemodal.style.color = "#000";
              closemodal.style.cursor = "pointer";
              closemodal.style.textDecoration = "underline";
              addTag(closemodal);
            }
            prog++;
          }
        }, 100);
      }
    });
  });
}

function getCardDetail(CardNo, url){
  xhra.access(url).then(function(doc){
    loads++;
    var CardDetail = {};
    CardDetail.cardNo = CardNo;
    CardDetail.url = doc.URL;
    CardDetail.imgURL = doc.getElementsByClassName("card_detail_img w_212")[0].src;
    var detail = doc.getElementsByClassName("card_detail_container f_l t_l")[0];
    CardDetail.attributeIcon = detail.getElementsByClassName("h_50 f_0")[0].children[0].src;
    CardDetail.rarityIcon = detail.getElementsByClassName("h_50 f_0")[0].children[1].src;
    CardDetail.gentotsuMax = detail.getElementsByClassName("card_detail_star_container v_b f_0")[0].children[0].children.length;
    CardDetail.gentotsuNum = detail.getElementsByClassName("card_detail_star_container v_b f_0")[0].children[1].children.length;
    CardDetail.kaikaIcon = (hoge = detail.getElementsByClassName("card_kaika")[0]) ? hoge.src : "https://ongeki-net.com/ongeki-mobile/img/card_icon_mikaika.png";
    CardDetail.name = detail.getElementsByClassName("p_t_5 f_14 l_h_12 break")[0].innerText;
    CardDetail.character = CardDetail.name.split("】")[1].split("[")[0];
    CardDetail.levelNum = parseInt(detail.getElementsByClassName("card_lv_block t_r f_0")[0].children[0].innerText);
    CardDetail.levelMax = parseInt(detail.getElementsByClassName("card_lv_block t_r f_0")[0].children[1].innerText.split("/")[1]);
    //var detailTable = ;
    Array.from(detail.getElementsByClassName("card_detail_param_block")[0].firstElementChild.rows).forEach(function(tr){
      // 攻撃力
      if(tr.cells[0].innerText.indexOf("攻撃力") >= 0){
        CardDetail.powerNum = parseInt(tr.cells[1].innerText.split("/")[0]);
        CardDetail.powerMax = parseInt(tr.cells[1].innerText.split("/")[1]);
      }
      // 印刷可能枚数
      if(tr.cells[0].innerText.indexOf("印刷可能枚数") >= 0){
        CardDetail.printable = parseInt(tr.cells[1].firstElementChild.innerText);
      }
      // 印刷期限
      /* 何もしない
      if(tr.cells[0].innerText.indexOf("印刷期限") >= 0){
      }
        */
      // バージョン
      if(tr.cells[0].innerText.indexOf("ver.") >= 0){
        CardDetail.ver = tr.cells[1].innerText;
      }
    });
    CardDetail.skillIcon = detail.getElementsByClassName("card_skill_icon")[0].src;
    CardDetail.skillName = detail.getElementsByClassName("f_11 l_h_12 p_l_5")[0].innerText.trim();
    CardDetail.skillDetail = detail.getElementsByClassName("f_10 l_h_10 v_t break")[0].innerText.trim();
    CardDetail.how2get = doc.getElementsByClassName("card_detail_other_item")[0].innerText.split("\n");
    CardDetail.ticket = [];
    for(var i=1; hoge = doc.getElementsByClassName("card_detail_other_item")[i]; i++){
      CardDetail.ticket.push({rarity : hoge.innerText.split("【")[1].split("】")[0], name : hoge.innerText.trim().split("\n")[0].split("】")[1].trim(), num : parseInt(hoge.innerText.trim().split("\n")[1].split("枚")[0].trim())});
    }
/*
    // 後で展開する dom 作成
    var div = doc.createElement("div");
    div.className = "wrapper main_wrapper t_c";
    div.appendChild(doc.getElementsByClassName("container3")[0].cloneNode(true));
    CardDetail.document = div.outerHTML;

    // 一覧のときに隠す要素
    CardDetail.display = "";
  */
    list.push(CardDetail);
  });
}

// 新規ページの header 設定
function setHeader(doc){
  // meta 設定
  var meta = doc.head.appendChild(doc.createElement("meta"));
  meta.setAttribute("charset", "UTF-8");

  meta = doc.head.appendChild(doc.createElement("meta"));
  meta.name = "viewport";
  meta.content = "width=device-width,initial-scale=1.0,user-scalable=yes,shrink-to-fit=no";

  meta = doc.head.appendChild(doc.createElement("meta"));
  meta.httpEquiv = "Content-Type";
  meta.content = "text/html; charset=utf-8";

  var title = doc.head.appendChild(doc.createElement("title"));
  title.innerText = "カード一覧ex";
}

// 新規ページの viewport 設定
function setViewport(win, doc){
  var baseW = 768;
  var iOSW = 0;
  var ua = win.navigator.userAgent.toLowerCase();
  var isiOS = (ua.indexOf("iphone") > -1) || (ua.indexOf("ipod") > -1) || (ua.indexOf("ipad") > -1);
  if(isiOS){
    iOSW = doc.documentElement.clientWidth;
  }
  win.addEventListener("resize", updateMetaViewport, false);
  win.addEventListener("orientationchange", updateMetaViewport, false);
  var ev = doc.createEvent("UIEvent");
  ev.initEvent("resize", true, true);
  win.dispatchEvent(ev);
  function updateMetaViewport(){
    var viewportContent;
    var w = win.outerWidth;
    if(isiOS){
      w = iOSW;
    }
    if(w < baseW){
      viewportContent = "width=480,initial-scale=" + w/480 + ",user-scalable=yes,shrink-to-fit=no";
    }else{
      viewportContent = "width=device-width,initial-scale=1.0,user-scalable=yes,shrink-to-fit=no";
    }
    doc.querySelector("meta[name='viewport']").setAttribute("content", viewportContent);
  }
}

function getJS(name){
  return new Promise(function(resolve){
    var s = document.head.appendChild(document.createElement("script"));
    s.id = name;
    s.src = `https://mel225.github.io/calcBS/${name}.js`;
    s.onload = function(){
      resolve();
    };
  });
}

function addStatus(status){
  statusbox.appendChild(document.createElement("span")).innerText = status;
  statusbox.appendChild(document.createElement("br"));
}

function addTag(tag){
  statusbox.appendChild(tag);
  statusbox.appendChild(document.createElement("br"));
}

function createFromData(data){
  var fd = new FormData();
  fd.append("datasize", data.length);
  for(var i = 0; i < data.length; i++){
    fd.append("name"+i, data[i].name);
    fd.append("skillname"+i, data[i].skillName);
    fd.append("skilldetail"+i, data[i].skillDetail);
    fd.append("skilltype"+i, data[i].skillIcon.split("skill_")[1].split(".png")[0]);
    fd.append("charname"+i, data[i].character);
    fd.append("rarity"+i, data[i].rarityIcon.split("icon_")[1].split(".png")[0]);
    fd.append("maxpower"+i, data[i].powerMax);
    fd.append("attr"+i, data[i].attributeIcon.split("icon_")[1].split(".png")[0]);
    fd.append("how2get"+i, data[i].how2get);
    fd.append("ver"+i, data[i].ver);
    fd.append("imgurl"+i, data[i].imgURL);
  }
  return fd;
}