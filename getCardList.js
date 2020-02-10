if(document.getElementById("xhrReader")){
  main();
}else{
  var s = document.createElement("script");
  s.src = "https://mel225.github.io/calcBS/xhrAccesser.js";
  s.id = "xhrReader";
  s.onload = main;
  document.head.appendChild(s);
}

async function main(){
  var CardList = await getCardDocList().then(async docs => {
    return Promise.all(docs.map(getCardDetail)).then(cards => {
      return cards;
    });
  });
  console.log(CardList);
}

function getCardDetail(CardDetailDoc){
  return new Promise(resolve => {
    var CardDetail = {};
    CardDetail.imgURL = CardDetailDoc.getElementsByClassName("card_detail_img w_212")[0].src;
    var detail = CardDetailDoc.getElementsByClassName("card_detail_container f_l t_l")[0];
    CardDetail.attribute = detail.getElementsByClassName("h_50 f_0")[0].children[0].src.split("icon_")[1].split(".png")[0];
    CardDetail.rarity = detail.getElementsByClassName("h_50 f_0")[0].children[1].src.split("icon_")[1].split(".png")[0];
    CardDetail.gentotsuMax = detail.getElementsByClassName("card_detail_star_container v_b f_0")[0].children[0].children.length;
    CardDetail.gentotsuNum = detail.getElementsByClassName("card_detail_star_container v_b f_0")[0].children[1].children.length;
    CardDetail.kaika = (hoge = detail.getElementsByClassName("card_kaika")[0]) ? hoge.src.split("icon_")[1].split(".png")[0] : "mikaika";
    CardDetail.name = detail.getElementsByClassName("p_t_5 f_14 l_h_12 break")[0].innerText;
    CardDetail.levelNum = parseInt(detail.getElementsByClassName("card_lv_block t_r f_0")[0].children[0].innerText);
    CardDetail.levelMax = parseInt(detail.getElementsByClassName("card_lv_block t_r f_0")[0].children[1].innerText.split("/")[1]);
    var detailTable = detail.getElementsByClassName("card_detail_param_block")[0].firstElementChild;
    var power = detailTable.rows[0].cells[1].innerText;
    CardDetail.powerNum = parseInt(power.split("/")[0]);
    CardDetail.powerMax = parseInt(power.split("/")[1]);
    CardDetail.printable = parseInt(detailTable.rows[1].cells[1].firstElementChild.innerText);
    CardDetail.ver = detailTable.rows[2].cells[1].innerText;
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

function getCardDocList(){
  var xhra = new xhrAccesser();
  return new Promise(async resolve => {
    // カード一覧のすべてのページを取得する
    var url = "https://ongeki-net.com/ongeki-mobile/card/cardList/pages/?type=0&ipType=0&ip=all&search=0&sIdx=-1&sort=0&order=asc&pIdx=";
    var pages = xhra.access(url + 1).then((doc) => {return doc.getElementById("pIdx").nextElementSibling.innerText.split("/")[1];});
    console.log("pages: " + await pages);
    var PageURLs = [];
    for(var i=1; i<=await pages; i++){
      PageURLs.push(url + (i+1));
    }
    setTimeout(resolve, 1, PageURLs);
  }).then(PageURLs => {
    // すべてのページにアクセスする
    return Promise.all(PageURLs.map(url => {
      return xhra.access(url);
    }));
  }).then(PageDocs => {
    // ページ内のカードURLを取得する
    CardURLs = [];
    return new Promise(resolve => {
      PageDocs.forEach(doc => {
        Array.prototype.push.apply(CardURLs, Array.from(doc.getElementsByClassName("t_c border_block m_5 p_5")).map(item => {
          var input = item.getElementsByTagName("input");
          var param = [];
          for(var j=0; j<input.length; j++){
            param.push(input[j].name + "=" + encodeURIComponent(input[j].value));
          }
          return "https://ongeki-net.com/ongeki-mobile/card/cardDetail/?" + param.join("&");
        }));
      });
      setTimeout(resolve, 1, CardURLs);
    });
  }).then(CardURLs => {
    // すべてのカードURLにアクセスする
    return Promise.all(CardURLs.map(url => {
      return xhra.access(url);
    }));
  });
}
