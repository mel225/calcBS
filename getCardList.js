main();

function main(){
  getCardListDoc(document).then(function(doc){
    
  }
}

function getCardDetail(CardDetailDoc){
  var CardDetail = {};
  CardDetail.imgURL = CardDetailDoc.getElementsByClassName("card_detail_img w_212")[0].src;
  var detail = CardDetailDoc.getElementsByClassName("card_detail_container f_l t_l")[0];
  CardDetail.attribute = detail.getElementsByClassName("h_50 f_0")[0].children[0].src.split("icon_")[1].split(".png")[0];
  CardDetail.rarity = detail.getElementsByClassName("h_50 f_0")[0].children[1].src.split("icon_")[1].split(".png")[0];
  CardDetail.gentotsuMax = detail.getElementsByClassName("card_detail_star_container v_b f_0")[0].children[0].children.length;
  CardDetail.gentotsuNum = detail.getElementsByClassName("card_detail_star_container v_b f_0")[0].children[1].children.length;
  CardDetail.kaika = (hoge = detail.getElementsByClassName("card_kaika")[0]) ? hoge.src.split("icon_")[1].split(".png")[0] : undefined;
  CardDetail.name = detail.getElementsByClassName("p_t_5 f_14 l_h_12 break").innerText;
  CardDetail.levelNum = detail.getElementsByClassName("card_lv_block t_r f_0")[0].children[0].innerText;
  CardDetail.levelMax = detail.getElementsByClassName("card_lv_block t_r f_0")[0].children[1].innerText.split("/")[1];
  var detailTable = detail.getElementsByClassName("card_detail_param_block")[0].firstElementChild;
  var power = detailTable.rows[0].cells[1].innerText;
  CardDetail.powerNum = power.split("/")[0];
  CardDetail.powerMax = power.split("/")[1];
  CardDetail.printable = detailTable.rows[1].cells[1].firstElementChild.innerText;
  CardDetail.ver = detailTable.rows[2].cells[1].innerText;
  CardDetail.skillName = detail.getElementsByClassName("f_11 l_h_12 p_l_5")[0].innerText;
  CardDetail.skillDetail = detail.getElementsByClassName("f_10 l_h_10 v_t break")[0].innerText;
  CardDetail.how2get = CardDetailDoc.getElementsByClassName("card_detail_other_item")[0].innerText.split("\n");
  CardDetail.ticket = [];
  for(var i=1; hoge = CardDetailDoc.getElementsByClassName("card_detail_other_item")[i]; i++){
    CardDetail.ticket.push({rarity : hoge.innerText.split("【")[1].split("】")[0], name : hoge.innerText.split("\n")[0].split("】")[1], num : hoge.innerText.split("\n")[1].split("枚")[0]});
  }

  return CardDetail;
}

function getCardUrlList(){
  var url = "https://ongeki-net.com/ongeki-mobile/card/cardList/pages/?type=0&ipType=0&ip=all&search=0&sIdx=-1&sort=0&order=asc&pIdx=";
  var xhra = new xhrAccess();
  xhra.access(url + 1).
}

class xhrAccesser {
  constructor(){
    this.count = 0;
  }

  async countup(){
    while(this.count >= 18){
      await (function(){
        return new Promise((resolve) => setTimeout(resolve, 1000));
      })();
    }
    this.count++;
  }

  async countdown(){
    this.count--;
  }

  this.access(url){
    return new Promise(function(resolve, reject){
      var request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.responseType = "document";
      this countup();
      request.send("");
      request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
          this.countdown();
          console.log(request.response.URL);
          if(request.response.URL.indexOf(url) >= 0){
            resolve(request.response);
          }else{
            reject();
          }
        }
      }
    });
  }
}