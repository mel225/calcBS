if(document.getElementById("xhrReader")){
  xhra.reset();
  main();
}else{
  Promise.all([new Promise(resolve=>{
    var s = document.createElement("script");
    s.src = "https://mel225.github.io/calcBS/xhrAccesser.js";
    s.id = "xhrReader";
    s.onload = ()=>resolve();
    document.head.appendChild(s);
  }), new Promise(resolve=>{
    var s = document.createElement("script");
    s.src = "https://mel225.github.io/calcBS/Sortable.js";
    s.id = "Sortable";
    s.onload = ()=>resolve();
    document.head.appendChild(s);
  }), new Promise(resolve=>{
    var s = document.createElement("script");
    s.src = "https://mel225.github.io/calcBS/printCardList.js";
    s.id = "printCardList";
    s.onload = ()=>resolve();
    document.head.appendChild(s);
  })]).then(()=>{
    main();
  });
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


function getCardDetail(CardNo, CardDetailDoc){
  return new Promise(resolve => {
    var CardDetail = {};
    CardDetail.cardNo = CardNo;
    CardDetail.url = CardDetailDoc.URL;
    CardDetail.imgURL = CardDetailDoc.getElementsByClassName("card_detail_img w_212")[0].src;
    var detail = CardDetailDoc.getElementsByClassName("card_detail_container f_l t_l")[0];
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
    CardDetail.how2get = CardDetailDoc.getElementsByClassName("card_detail_other_item")[0].innerText.split("\n");
    CardDetail.ticket = [];
    for(var i=1; hoge = CardDetailDoc.getElementsByClassName("card_detail_other_item")[i]; i++){
      CardDetail.ticket.push({rarity : hoge.innerText.split("【")[1].split("】")[0], name : hoge.innerText.trim().split("\n")[0].split("】")[1].trim(), num : parseInt(hoge.innerText.trim().split("\n")[1].split("枚")[0].trim())});
    }

    // 後で展開する dom 作成
    var div = CardDetailDoc.createElement("div");
    div.className = "wrapper main_wrapper t_c";
    div.appendChild(CardDetailDoc.getElementsByClassName("container3")[0].cloneNode(true));
    CardDetail.document = div.outerHTML;

    // 一覧のときに隠す要素
    CardDetail.display = "";

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