var fs = require('fs');
var mm = require('musicmetadata');

var userHome = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

var mediaDirs = {
  music: userHome+'/music/',
  videos: userHome+'/videos/'
};

var loadData = JSON.parse(fs.readFileSync('./data/folderDir.json', 'utf8'));

if (loadData.music){
  mediaDirs.music = loadData.music.replace('%userHome%', userHome);
}
if (loadData.videos){
  mediaDirs.videos = loadData.videos.replace('%userHome%', userHome);
}
delete loadData;

function GetFileData(path, callback){
  if (typeof(callback) == 'function'){
    fs.stat(path, function(err, stats){
      if (err){
        console.error(err);
      }else{
        callback(stats);
      }
    });
  }
}

function IndexDir(dir, recursive = true){
  var results = [];
  var data = fs.readdirSync(dir);
  for (let item of data){
    if (recursive){
      try{
        var states = fs.statSync(dir+"/"+item);
        if (states.isDirectory()){
          var folderIndex = IndexDir(dir+'/'+item);
          for (let subItem of folderIndex){
            results.push(item+'/'+subItem);
          }
        }else{
          results.push(item);
        }
      }catch (err2){
        console.error(err2);
        results.push(item);
      }
    }else{
      results.push(item);
    }
  }
  return results;
}

function StatTest(){
  var startTime = Date.now();
  GetFileData('C:/Users/Ajani Bilby/music/DaftPunk/Tron Legacy/tron_legacy_-_soundtrack_ost_-_02_th-tFXYuw96d0c_fmt135.mp3', function(stats){
    console.log(Date.now()-startTime);
  });
}
