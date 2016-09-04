function GetSongMeta(file, callback){
  var parser = mm(fs.createReadStream(file), function (err, metadata) {
    if (err){
      console.error(err);
    }else{
      if (typeof(callback) == "function"){
        callback(metadata);
      }
    }
  });
}

function AudioLoadIndex(){
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
  }
  if (typeof(saveData.supportedFiles) == "object"){
    songIndex.supportedFiles = saveData.supportedFiles;
  }
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
    title: {}
  },
  files: [],
  unscanned: [],
  supportedFiles: ['mp3'],
  loop: {
    scanAllMeta: function(id = 0){
      GetSongMeta(songIndex.files[id], function(metadata){
        for (let artist in metadata.artist){
          if (typeof(songIndex.sorted.artist[artist]) != 'object'){
            songIndex.sorted.artist[artist] = [];
          }
          songIndex.sorted.artist[artist].push(id);
        }
        for (let genre in metadata.genre){
          if (typeof(songIndex.sorted.genre[genre]) != 'object'){
            songIndex.sorted.genre[genre] = [];
          }
          songIndex.sorted.genre[genre].push(id);
        }
        if (typeof(songIndex.sorted.title[metadata.title]) != 'object'){
          songIndex.sorted.title[metadata.title] = [];
        }
        songIndex.sorted.title[metadata.title].push(id);
        if (typeof(songIndex.sorted.album[metadata.album]) != 'object'){
          songIndex.sorted.album[metadata.album] = [];
        }
        songIndex.sorted.album[metadata.album].push(id);

        if (id+1 < songIndex.files.length){
          console.log((id/songIndex.files.length*100).toFixed(2) + '%');
          songIndex.loop.scanAllMeta(id+1);
        }else{
          AudioSaveIndex();
        }
      });
    },
    scanNewMeta: function(){
      id = songIndex.files.length;
      GetSongMeta(songIndex.unscanned[0], function(metadata){

        songIndex.files.push(songIndex.unscanned[0]);

        for (let artist in metadata.artist){
          if (typeof(songIndex.sorted.artist[artist]) != 'object'){
            songIndex.sorted.artist[artist] = [];
          }
          songIndex.sorted.artist[artist].push(id);
        }
        for (let genre in metadata.genre){
          if (typeof(songIndex.sorted.genre[genre]) != 'object'){
            songIndex.sorted.genre[genre] = [];
          }
          songIndex.sorted.genre[genre].push(id);
        }
        if (typeof(songIndex.sorted.title[metadata.title]) != 'object'){
          songIndex.sorted.title[metadata.title] = [];
        }
        songIndex.sorted.title[metadata.title].push(id);
        if (typeof(songIndex.sorted.album[metadata.album]) != 'object'){
          songIndex.sorted.album[metadata.album] = [];
        }
        songIndex.sorted.album[metadata.album].push(id);

        if (id+1 < songIndex.unscanned.length){
          //console.log(songIndex.unscanned.length + ' remaining');
          songIndex.unscanned.shift();
          songIndex.loop.scanNewMeta();
        }else{
          AudioSaveIndex();
          //songIndex.loop.scanAllMeta();
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

songIndex.loop.scanNewMeta();
