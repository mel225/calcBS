class xhrAccesser {
  constructor(){
    this.count = 0;
    this.time = new Date().getTime();
    this.id = 0;
    this.completeTimeList = [];
  }

  resetTime(){
    this.time = new Date().getTime();
  }

  printTime(msg){
    var time = (new Date().getTime() - this.time) / 1000;
    console.log(msg + " " + time + " ms.");
    return time;
  }

  regist(){
    var t = this;
    return new Promise(async resolve => {
      var id = t.id++;
      t.printTime("[ " + id + " / " + t.count + " ] regist.");
      while(id != t.count)
        await new Promise(resolve => setTimeout(resolve, 100));
      await new Promise(resolve => setTimeout(resolve, 50));
      t.printTime("[ " + id + " ] start. ");
      resolve();
    });
  }

  complete(){
    this.completeTimeList.push(this.printTime("[ " + this.count + " ] complete."));
    this.count++;
  }

  access(url){
    var t = this;
    return new Promise(async function(resolve, reject){
      await t.regist();
      var request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.responseType = "document";
      request.send("");
      request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
          console.log(request.response.URL);
          t.complete();
          if(request.response.URL.indexOf(url) >= 0){
            resolve(request.response);
          }else{
            reject("Error: URL がちがうよ？");
          }
        }
      }
    });
  }
}