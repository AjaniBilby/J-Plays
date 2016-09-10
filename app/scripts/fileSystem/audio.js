function GetSongMeta(file, callback, onErr){
  var parser = mm(fs.createReadStream(file), function (err, metadata) {
    if (err){
      console.error(err);
      if (typeof(onErr) == 'function'){
        onErr(err);
      }
    }else{
      if (typeof(callback) == "function"){
        callback(metadata);
      }
    }
  });
}

function AudioLoadIndex(){
  fs.access('data/musicIndex.json', fs.F_OK, function(err){
    if (!err){
      var saveData = JSON.parse(fs.readFileSync('data/musicIndex.json', 'utf8'));
      if (typeof(saveData.sorted) == 'object' && typeof(saveData.files) == 'object'){
        songIndex.files = saveData.files;
        if (typeof(saveData.sorted.album) == 'object'){
          songIndex.sorted.album = saveData.sorted.album;
        }
        if (typeof(saveData.sorted.artist) == 'object'){
          songIndex.sorted.artist = saveData.sorted.artist;
        }
        if (typeof(saveData.sorted.genre) == 'object'){
          songIndex.sorted.genre = saveData.sorted.genre;
        }
        if (typeof(saveData.sorted.title) == 'object'){
          songIndex.sorted.title = saveData.sorted.title;
        }
        if (typeof(saveData.sorted.trackNum) == 'object'){
          songIndex.sorted.trackNum = saveData.sorted.trackNum;
        }
      }
      if (typeof(saveData.supportedFiles) == "object"){
        songIndex.supportedFiles = saveData.supportedFiles;
      }
    }
  });
}

function AudioSaveIndex(){
  fs.writeFile('data/musicIndex.json', JSON.stringify(songIndex), function(err){
    if (err){
      console.error(err);
    }else{
      console.log('It\'s saved!');
    }
  });
}

var songIndex = {
  sorted: {
    album: {},
    artist: {},
    genre: {},
    title: {},
    trackNum: {}
  },
  files: [],
  unscanned: [],
  supportedFiles: ['mp3'],
  loop: {
    scanAllMeta: function(id = 0){
      GetSongMeta(songIndex.files[id], function(metadata){
        for (let artist of metadata.artist){
          if (typeof(songIndex.sorted.artist[artist]) != 'object'){
            songIndex.sorted.artist[artist] = [];
          }
          if (songIndex.sorted.artist.indexOf(artist) == -1){
            songIndex.sorted.genre[artist].push(id);
          }
        }
        for (let genre of metadata.genre){
          if (typeof(songIndex.sorted.genre[genre]) != 'object'){
            songIndex.sorted.genre[genre] = [];
          }
          if (songIndex.sorted.genre.indexOf(genre) == -1){
            songIndex.sorted.genre[genre].push(id);
          }
        }
        if (typeof(songIndex.sorted.title[metadata.title]) != 'object'){
          songIndex.sorted.title[metadata.title] = [];
        }
        if (songIndex.sorted.title.indexOf(metadata.title) == -1){
          songIndex.sorted.title[metadata.title].push(id);
        }
        if (typeof(songIndex.sorted.album[metadata.album]) != 'object'){
          songIndex.sorted.album[metadata.album] = [];
        }
        if (metadata.album === ''){
          metadata.album = 'Unknown';
        }
        if (songIndex.sorted.album.indexOf(metadata.album) == -1){
          songIndex.sorted.album[metadata.album].push(id);
        }
        if (typeof(songIndex.sorted.trackNum[metadata.track.no]) != 'object'){
          songIndex.sorted.trackNum[metadata.track.no] = [];
        }
        if (songIndex.sorted.trackNum.indexOf(metadata.track.no) == -1){
          songIndex.sorted.trackNum[metadata.track.no].push(id);
        }

        if (id+1 < songIndex.files.length){
          console.log((id/songIndex.files.length*100).toFixed(2) + '%');
          songIndex.loop.scanAllMeta(id+1);
        }else{
          AudioSaveIndex();
          audio.fill.album();
          audio.fill.artist();
          audio.fill.genre();
        }
      }, function(err){
        if (id+1 < songIndex.files.length){
          console.log((id/songIndex.files.length*100).toFixed(2) + '%');
          songIndex.loop.scanAllMeta(id+1);
        }else{
          AudioSaveIndex();
          audio.fill.album();
          audio.fill.artist();
          audio.fill.genre();
        }
      });
    },
    scanNewMeta: function(){
      GetSongMeta(songIndex.unscanned[0], function(metadata){
        id = songIndex.files.length;

        for (let artist of metadata.artist){
          if (typeof(songIndex.sorted.artist[artist]) != 'object'){
            songIndex.sorted.artist[artist] = [];
          }
          if (songIndex.sorted.artist[artist].indexOf(artist) == -1){
            songIndex.sorted.artist[artist].push(id);
          }
        }
        for (let genre of metadata.genre){
          if (typeof(songIndex.sorted.genre[genre]) != 'object'){
            songIndex.sorted.genre[genre] = [];
          }
          if (songIndex.sorted.genre[genre].indexOf(genre) == -1){
            songIndex.sorted.genre[genre].push(id);
          }
        }
        if (typeof(songIndex.sorted.title[metadata.title]) != 'object'){
          songIndex.sorted.title[metadata.title] = [];
        }
        if (songIndex.sorted.title[metadata.title].indexOf(metadata.title) == -1){
          songIndex.sorted.title[metadata.title].push(id);
        }
        if (metadata.album === ''){
          metadata.album = 'Unknown';
        }
        if (typeof(songIndex.sorted.album[metadata.album]) != 'object'){
          songIndex.sorted.album[metadata.album] = [];
        }
        if (songIndex.sorted.album[metadata.album].indexOf(metadata.album) == -1){
          songIndex.sorted.album[metadata.album].push(id);
        }
        if (typeof(songIndex.sorted.trackNum[metadata.track.no]) != 'object'){
          songIndex.sorted.trackNum[metadata.track.no] = [];
        }
        if (songIndex.sorted.trackNum[metadata.track.no].indexOf(metadata.track.no) == -1){
          songIndex.sorted.trackNum[metadata.track.no].push(id);
        }


        songIndex.files.push(songIndex.unscanned[0]);

        if (0 < songIndex.unscanned.length){
          songIndex.unscanned.shift();
          songIndex.loop.scanNewMeta();
        }else{
          AudioSaveIndex();
          audio.fill.album();
          audio.fill.artist();
          audio.fill.genre();
        }
      }, function(err){
        if (0 < songIndex.unscanned.length){
          songIndex.unscanned.shift();
          songIndex.loop.scanNewMeta();
        }else{
          AudioSaveIndex();
          audio.fill.album();
          audio.fill.artist();
          audio.fill.genre();
        }
      });
    }
  }
};

AudioLoadIndex();

var audioTemp = IndexDir(userHome+'/music/');

for (let file of audioTemp){
  var extention = file.split('.');
  extention = extention[extention.length-1];
  file = userHome+'/music/'+file;

  if (songIndex.supportedFiles.indexOf(extention) != -1){
    if (songIndex.files.indexOf(file) == -1){
      songIndex.unscanned.push(file);
    }
  }
}

delete temp;

songIndex.loop.scanNewMeta();

var audio = {
  getItemOfSong: {
    artist: function(songId){
      var artists = [];
      for (let artist in songIndex.sorted.artist){
        if (songIndex.sorted.artist[artist].indexOf(songId) != -1){
          artists.push(artist);
        }
      }
      return artists;
    },
    album: function(songId){
      for (let album in songIndex.sorted.album){
        if (songIndex.sorted.album[album].indexOf(songId) != -1){
          return album;
        }
      }
    },
    genre: function(songId){
      var genres = [];
      for (let genre in songIndex.sorted.genre){
        if (songIndex.sorted.genre[genre].indexOf(songId) != -1){
          genres.push(genre);
        }
      }
      return genres;
    },
    title: function(songId){
      for (let title in songIndex.sorted.title){
        if (songIndex.sorted.title[title].indexOf(songId) != -1){
          return title;
        }
      }
    },
    track: function(songId){
      for (let track in songIndex.sorted.trackNum){
        if (songIndex.sorted.trackNum[track].indexOf(songId) != -1){
          return track;
        }
      }
    }
  },
  generateHTML: {
    artist: function(artist){
      var img = 'icons/defaultIcon.svg';

      var html = '<div id="'+artist+'-album" class="itemCase" style="height:70px"  onclick="audio.onclick.item.artist(this)">';
      html += '<h4>'+artist+'</h4>';
      html += '<h5> '+songIndex.sorted.artist[artist].length+' Songs</h5>';
      html += '</div>';
      return html;
    },
    album: function(album){
      var img = 'icons/defaultIcon.svg';
      var name = album;
      if (name.length > 22){
        name = name.substr(0, 20) + '...';
      }

      var html = '<div id="'+album+'-album" class="itemCase" onclick="audio.onclick.item.album(this)">';
      html += '<img style="max-width: 75px; max-height: 75px" src="'+img+'">';
      html += '<h4>'+name+'</h4>';
      html += '<h5>'+songIndex.sorted.album[album].length+' Songs</h5>';
      html += '</div>';
      return html;
    },
    genre: function(genre){
      var img = 'icons/defaultIcon.svg';

      var html = '<div id="'+genre+'-album" class="itemCase" style="height:70px"  onclick="audio.onclick.item.genre(this)">';
      html += '<h4>'+genre+'</h4>';
      html += '<h5> '+songIndex.sorted.genre[genre].length+' Songs</h5>';
      html += '</div>';
      return html;
    },
    song: function(songId){
      var html = '';
      html += '<div class="songItem" id="'+ (songId-1) +'-song" onclick="audio.onclick.item.song(this, event)" oncontextmenu="console.log(event)">';
      html += '<div class="track">'+ (audio.getItemOfSong.track(songId) || '-') +'</div>';
      html += '<div class="title">'+audio.getItemOfSong.title(songId)+'</div>';
      html += '<div style="float: left">'+audio.getItemOfSong.artist(songId)+'</div>';
      html += '</div>';
      return html;
    }
  },
  fill: {
    album: function(){
      var element = document.getElementById('music-album');
      element.innerHTML = '';
      var albumList = [];
      for (let album in songIndex.sorted.album){
        albumList.push(album);
      }
      albumList.sort();
      var catagory = '';
      for (let album of albumList){
        if (album.substr(0,1).toUpperCase() != catagory){
          catagory = album.substr(0,1).toUpperCase();
          element.innerHTML += '<div class="tabHeadder">'+catagory.toUpperCase()+'</div>';
        }

        element.innerHTML += audio.generateHTML.album(album);
      }
    },
    artist: function(){
      var element = document.getElementById('music-artist');
      element.innerHTML = '';
      var artistList = [];
      for (let artist in songIndex.sorted.artist){
        artistList.push(artist);
      }
      artistList.sort();
      for (let artist of artistList){
        element.innerHTML += audio.generateHTML.artist(artist);
      }
    },
    genre: function(){
      var element = document.getElementById('music-genre');
      element.innerHTML = '';
      var genreList = [];
      for (let genre in songIndex.sorted.genre){
        genreList.push(genre);
      }
      genreList.sort();
      var catagory = '';
      for (let genre of genreList){
        if (genre.substr(0,1).toUpperCase() != catagory){
          catagory = genre.substr(0,1).toUpperCase();
          element.innerHTML += '<div class="tabHeadder">'+catagory.toUpperCase()+'</div>';
        }

        element.innerHTML += audio.generateHTML.genre(genre);
      }
    },
    songs: function(songIds, title, sortBy = 'track'){
      songIds.sort(function(a, b){
        switch (sortBy) {
          case 'artist':
            return audio.getItemOfSong.artist(a) - audio.getItemOfSong.artist(b);
          case 'album':
            return audio.getItemOfSong.album(a) - audio.getItemOfSong.album(b);
          case 'track':
            return (Number(audio.getItemOfSong.track(a)) || 0) > (Number(audio.getItemOfSong.track(b)) || 0);
          case 'genre':
            return;
          default:
            return audio.getItemOfSong.title(a) - audio.getItemOfSong.title(b);
        }
      });


      document.getElementById('music-artist').style.display = 'none';
      document.getElementById('music-genre').style.display = 'none';
      document.getElementById('music-album').style.display = 'none';
      var element = document.getElementById('music-song');
      element.style.display = 'block';
      var html = '';
      for (let songId of songIds){
        html += audio.generateHTML.song(songId);
      }
      element.innerHTML = html;
    }
  },
  onclick: {
    bar: {
        album: function(){
          document.getElementById('music-artist').style.display = 'none';
          document.getElementById('music-genre').style.display = 'none';
          document.getElementById('music-album').style.display = 'block';
          document.getElementById('music-song').style.display = 'none';

          if (songIndex.unscanned.length > 1){
            audio.fill.album();
          }
        },
        artist: function(){
          document.getElementById('music-artist').style.display = 'block';
          document.getElementById('music-genre').style.display = 'none';
          document.getElementById('music-album').style.display = 'none';
          document.getElementById('music-song').style.display = 'none';

          if (songIndex.unscanned.length > 1){
            audio.fill.artist();
          }
        },
        genre: function(){
          document.getElementById('music-artist').style.display = 'none';
          document.getElementById('music-genre').style.display = 'block';
          document.getElementById('music-album').style.display = 'none';
          document.getElementById('music-song').style.display = 'none';

          if (songIndex.unscanned.length > 1){
            audio.fill.genre();
          }
        }
      },
    item: {
      artist: function(element){
        var artist = element.id.substr(0, element.id.length-7);
        audio.fill.songs(songIndex.sorted.artist[artist], artist, 'title');
      },
      album: function(element){
        var album = element.id.substr(0, element.id.length-6);
        audio.fill.songs(songIndex.sorted.album[album], album, 'track');
      },
      genre: function(element){
        var genre = element.id.substr(0, element.id.length-6);
        audio.fill.songs(songIndex.sorted.genre[genre], genre, 'track');
      },
      song: function(element, event){
        console.log(event);
        if (event.button === 0){
          var songId = element.id.substr(0, element.id.length-5);
          console.log(songId);
          Play(songIndex.files[songId]);
        }else if (event.button === 2){
          //Right click
          var songId = element.id.substr(0, element.id.length-5);
          console.log(songId);
          player.list.push(songIndex.files[songId]);
        }
      }
    }
  }
};
