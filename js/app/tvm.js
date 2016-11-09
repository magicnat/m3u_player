// 初始化播放器
var player = videojs('hlsPlayer');

// TVM Func
var tvmPlayer = (function() {
  
  var fn = {
    
    // 獲取節目列表
    getChannel : function(url) {
      var xmlHttp = new XMLHttpRequest(),
          channelList = document.getElementById('channelList');
      // 讀取遠端 m3u
      xmlHttp.onreadystatechange = function() {
        if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
          var m3uContent = m3u.parse(xmlHttp.responseText),
              i = 0;
          for(var i = 0; i < m3uContent.length; i++) {
            var id = i+1,
                ch = m3uContent[i],
                title = ch.name,
                url = ch.url,
                item = document.createElement('li');
            item.title = title;
            item.setAttribute('data-id', id);
            item.setAttribute('play-url', url);
            item.innerHTML = '<span class="num">' + id + '</span>' + '<span class="t">' + title + '</span>';
            channelList.appendChild(item);
            console.log(item);
            item.onclick = function() {
              var url = this.getAttribute('play-url');
              var id = this.getAttribute('data-id');
              fn.playUrl(id, url);
            };
          }
        }
      }
      xmlHttp.open('GET', url, true);
      xmlHttp.send();
    },

    // 播放指定的 m3u8
    playUrl: function(id, url) {
      player.src({
        src: url,
        type: 'application/x-mpegURL'
      });
      if(window.innerWidth < 768 || window.innerHeight < 768) fn.toggleMenu();
      player.play();
      fn.setHighlight(id);
    },
    
    // 播放指定節目
    /*playChannel : function(id) {
      var list = document.getElementById('channelList').childNodes;
      for(var i = 0; i < list.length; i++) {
        var ch = list[i];
        if(ch.getAttribute('data-id') == id) {
          player.src({
            src: ch.getAttribute('playUrl'),
            type: 'application/x-mpegURL'
	  });
          break;
        }
      }
      player.play();
      fn.setHighlight(id);
    },*/
    
    // 設定正在播放節目
    setHighlight : function(id) {
      var list = document.getElementById('channelList').childNodes,
          playbackTitle = document.getElementById('chTitle'),
          itemDisplay = document.getElementById('nowPlaying'),
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
      itemDisplay.value = fn.getCurrentUrl();
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

    toggleItemInfo : function() {
      var info = document.getElementById('itemInfo');
      if(info.getAttribute('class')) info.removeAttribute('class');
      else info.setAttribute('class', 'hide');
    },

    toggleMenu : function() {
      var menu = document.getElementById('menu'),
          back = document.getElementById('chBack'),
          settingBtn = document.getElementById('epgBtn'),
          winWidth = window.innerWidth;
      if(menu.className.indexOf("hide") >= 0) {
        menu.className = "left-panel";
        back.className = "hide";
        if(winWidth < 600) settingBtn.className = "hide"; 
      } else {
        menu.className = "hide";
        back.className = "";
        settingBtn.className = "";
      }
      fn.uiResize();
    },

    uiResize : function() {
      var navHeight = document.getElementById('appInfoBar').clientHeight,
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
    },
    
    // 初始化頁面
    initUI : function() {
      window.onresize = function(){
        fn.uiResize();
      }
      fn.uiResize();
      /* 為「正在播放」與全屏下返回的按鈕綁定事件 */
      var playbackTitle = document.getElementById('chTitle'),
          backClick = document.getElementById('chBack');
      playbackTitle.onclick = function() {
        fn.toggleItemInfo();
      };
      backClick.onclick = function() {
        fn.toggleMenu();
      };
      /* 寫在這裡欸... 真糟糕 */
      if(window.innerWidth < 600) document.getElementById('epgBtn').className = "hide";
    },

    getCurrentUrl : function() {
        return player.cache_.src ? player.cache_.src : "";
    },

    loadSetting : function() {
      try {
        var settingObj = JSON.parse(localStorage["playerSettings"]),
            url = settingObj.url;
        fn.getChannel(url);
      } catch (e) {
        fn.promptSetting();
      }
 
    },

    // 設置窗口
    promptSetting : function() {
      var mask = fn.drawMask('setting'),
          settingWin = document.createElement('div');
          settingWin.className = 'setting_panel win';
          settingWin.innerHTML = '<span class="t">設置</span><span id="win_close" class="dismiss">✕</span><div class="ent"><input type="text"" id="m3uVal" placeholder="m3u 地址"><input type="button" id="doneBtn" value="完成"></div>';
      mask.appendChild(settingWin);
      var donebtn = document.getElementById('doneBtn'),
          closebtn = document.getElementById('win_close');
      closebtn.onclick = function() {
        fn.removeWin('setting');
      };
      donebtn.onclick = function() {
        var url = document.getElementById('m3uVal').value,
            playerSettings = {};
        playerSettings.url = url;
        localStorage["playerSettings"] = JSON.stringify(playerSettings);
        fn.getChannel(url);
        fn.removeWin('setting');
      };
    },

    // 繪製藉着層
    drawMask : function(id) {
      var root = document.getElementsByClassName('wrap'),
          mask = document.createElement('div');
          mask.id = id;
      mask.className = 'mask';
      root[0].appendChild(mask);
      return mask;
    },

    // 刪除彈窗
    removeWin : function(id) {
      var root = document.getElementsByClassName('wrap'),
          target = document.getElementById(id);
      root[0].removeChild(target);
    }
    
    // 獲取伺服器完整地址
    /*getApiUrl : function(apiName) {
      var url = '';
      if(tvmConf['ssl']) {
        url += 'https://';
      } else {
        url += 'http://';
      }
      url += tvmConf['host'] + ':' + tvmConf['port'] + '/' + tvmConf['path'] + '/api/' + apiName + '.php';
      return url;
    }*/
    
  },
      
  init = function() {
    fn.initUI();
    fn.loadSetting();
    //fn.promptSetting();
    //fn.getChannel();
  };
  
  return  {
    fn : fn,
    init : init
  }
  
})();

tvmPlayer.init();
