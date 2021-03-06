(function(){
  if(window.xhra === undefined){
    class xhrAccesser {
      constructor(){
        this.count = 0;
        this.time = new Date().getTime();
        this.id = 0;
        this.completeTimeList = [];
        this.clearing = false;
        this.stopping = false;
      }
      
      resetTime(){
        this.time = new Date().getTime();
      }

      resetCount(){
        this.count = 0;
        this.id = 0;
        this.completeTimeList = [];
      }

      reset(){
        this.resetTime();
        this.resetCount();
      }

      printTime(msg){
        var time = (new Date().getTime() - this.time) / 1000;
        console.log(msg + " " + time + " sec.");
        return time;
      }

      regist(){
        var t = this;
        return new Promise(async resolve => {
          var id = t.id++;
          t.printTime("[ " + (id+1) + " ] regist.");
          var timer = setInterval(()=>{
            if(t.clearing){
              clearInterval(timer);
              t.printTime("[ " + (id+1) + " / " + t.id + " ] cleared. ");
              setTimeout(()=>{t.clearing=false;}, 20);
              t.count++;
            }
            if(t.count == id && !t.stopping && !t.clearing){
              t.printTime("[ " + (id+1) + " / " + t.id + " ] start. ");
              
              clearInterval(timer);
              setTimeout(resolve, 100);
            }
          }, 10);
        });
      }
      
      complete(){
        this.completeTimeList.push(this.printTime("[ " + (this.count+1) + " / " + this.id + " ] complete."));
        this.count++;
      }
      
      access(url){
        var t = this;
        return new Promise(async function(resolve, reject){
          await t.regist();
          var request = new XMLHttpRequest();
          request.open("GET", url, true);
          request.responseType = "document";
          request.onload = function() {
            console.log(request.response.URL);
            setTimeout(()=>t.complete(), 20);
            if(request.response.URL.indexOf(url) >= 0){
              resolve(request.response);
            }else{
              reject("Error: URL がちがうよ？");
            }
          };
          request.send("");
        });
      }
      
      stop(){
        this.stopping = true;
      }
      
      start(){
        this.stopping = false;
      }
      
      clear(){
        this.clearing = true;
      }
    }

    window.xhra = new xhrAccesser();
  }
}) ()