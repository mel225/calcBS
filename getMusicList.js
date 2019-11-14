var musicList;
getMusicList();

function getMusicList(){
  var url = "https://mel225.github.io/calcBS/MusicList.json";
  var xhr = new XMLHttpRequest();
  xhr.oepn("GET", url);
  xhr.onload = function(){
    musicList = JSON.parse(xhr.responseText);
  };
  xhr.send("");
}