// 初始化播放器
var player = videojs('hlsPlayer');

// TVM Func
var tvmPlayer = (function() {
  
  var fn = {
    
    // 獲取節目列表
    getChannel : function() {
      var xmlHttp = new XMLHttpRequest(),
          channelList = document.getElementById('channelList'),
          url = fn.getApiUrl('channel') + '';
      // 讀取遠端 JSON
      xmlHttp.onreadystatechange = function() {
        if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
          var jsonContent = JSON.parse(xmlHttp.responseText);
          for(key in jsonContent) {
            var ch = jsonContent[key],
                item = document.createElement('li');
            item.title = ch.name;
            item.setAttribute('data-id', ch.id);
            item.innerHTML = '<span class="num">' + ch.id + '</span>' + '<span class="t">' + ch.name + '</span>';
            channelList.appendChild(item);
            item.onclick = function() {
              var id = this.getAttribute('data-id');
              fn.playChannel(id);
            };
          }
        }
      }
      xmlHttp.open('GET', url, true);
      xmlHttp.send();
    },
    
    // 播放指定節目
    playChannel : function(id) {
      var xmlHttp = new XMLHttpRequest(),
          url = fn.getApiUrl('url') + '?user=minalinsky&password=svxcee&id=' + id;
      // 讀取遠端 JSON
      xmlHttp.onreadystatechange = function() {
        if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
          var jsonContent = JSON.parse(xmlHttp.responseText);
          player.src({
            src: jsonContent.url,
            type: 'application/x-mpegURL'
          });
          player.play();
        }
      }
      xmlHttp.open('GET', url, true);
      xmlHttp.send();
      fn.setHighlight(id);
    },
    
    // 設定正在播放節目
    setHighlight : function(id) {
      var list = document.getElementById('channelList').childNodes,
          playbackTitle = document.getElementById('chTitle'),
          chName = '';
      for(var i = 0; i < list.length; i++) {
        var ch = list[i];
        if(ch.getAttribute('data-id') != id) {
          ch.removeAttribute('class', 'curr');
        } else {
          ch.setAttribute('class', 'curr');
          chName = ch.title;
        }
      }
      playbackTitle.removeAttribute('class', 'hide');
      playbackTitle.innerHTML = chName;
      playbackTitle.title = chName;
    },
    
    // 搜尋節目列表
    searchChannel : function() {
      var keyword = document.getElementById('channelSearchBox').value,
          list = document.getElementById('channelList').childNodes;
      for(var i = 0; i < list.length; i++) {
        var ch = list[i];
        if(keyword != '' && ch.title.indexOf(keyword) < 0) {
          ch.setAttribute('class', 'hide');
        } else {
          ch.removeAttribute('class', 'hide');
        }
      }
    },
    
    // 初始化頁面
    initUI : function() {
      function action() {
        var navHeight = document.getElementById('appMenuToggle').clientHeight,
            navWidth = document.getElementById('appMenuToggle').clientWidth,
            searchBarHeight = document.getElementsByClassName('search-panel')[0].clientHeight,
            winHeight = window.innerHeight,
            winWidth = window.innerWidth,
            channelHeight = winHeight - navHeight - searchBarHeight,
            playerHeight = winHeight - navHeight,
            rightWidth = winWidth - navWidth;
        document.getElementById('channelList').style.height = channelHeight + 'px';
        document.getElementsByClassName('right-panel')[0].style.width = rightWidth + 'px';
        document.getElementsByClassName('player-panel')[0].style.height = playerHeight + 'px';
      };
      window.onresize = function(){
        action();
      }
      action();
    },
    
    // 獲取伺服器完整地址
    getApiUrl : function(apiName) {
      var url = '';
      if(tvmConf['ssl']) {
        url += 'https://';
      } else {
        url += 'http://';
      }
      url += tvmConf['host'] + ':' + tvmConf['port'] + '/' + tvmConf['path'] + '/api/' + apiName + '.php';
      return url;
    }
    
  },
      
  init = function() {
    fn.initUI();
    fn.getChannel();
  };
  
  return  {
    fn : fn,
    init : init
  }
  
})();

tvmPlayer.init();
