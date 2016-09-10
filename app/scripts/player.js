var player = {
  output: null,
  seek: null,
  play: null,
  loop: null,
  list: [],
  currentlyPlaying: 0,
  looping: false,
  shuffle: false
};

body.onLoad = function(){
  player.output = document.getElementById('player');
  player.seek = document.getElementById('player-seek');
  player.play = document.getElementById('playButton');
};

function Play(file){
  if (typeof(file) == 'number'){
    file = songIndex.files[file];
  }
  console.log(file);

  if (player.output.paused || file){
    if (file){
      player.output.innerHTML = "";
			var source = document.createElement("source");
			source.id = "source";
			source.src = file;
			player.output.appendChild(source);
      player.output.currentTime = 0;
      GetSongMeta(file, function(metadata){
        console.log(metadata);
        document.getElementById('music-title').innerHTML = metadata.title;
        document.getElementById('music-artist').innerHTML = metadata.artist.join(', ');
        if (metadata.title.length > 21){
          document.getElementById('music-title').className = 'scrolling';
        }else{
          document.getElementById('music-title').className = 'default';
        }
        if (metadata.title.length > 30){
          document.getElementById('music-artist').className = 'scrolling';
        }else{
          document.getElementById('music-artist').className = 'default';
        }
      });
      player.output.load();
    }
    player.output.play();
    document.getElementById('playIcon').style.display = 'none';
    document.getElementById('pauseIcon').style.display = 'block';
  }else{
    player.output.pause();
    document.getElementById('playIcon').style.display = 'block';
    document.getElementById('pauseIcon').style.display = 'none';
  }
}

function FileEnd(){
  console.log('file end');
  player.currentlyPlaying += 1;

  if (player.currentlyPlaying >= player.list){
    player.currentlyPlaying = 0;
  }

  Play(player.list[player.currentlyPlaying]);
}

function Seeking(start){
  player.seek['data-searching'] = start;
}

function Seek(percent){
  percent /= 100;
  player.output.currentTime = player.output.duration*percent;
  Seeking(false);
}

function PlayerUpdate(){
  if (player.seek){
    if (!player.seek['data-searching']){
      var percent = player.output.currentTime/player.output.duration;
      player.seek.value = percent*100;
    }
  }

  if (player.output){
    if (!player.output.paused && player.output.currentTime == player.output.duration){
      FileEnd();
    }
  }

  window.requestAnimationFrame(PlayerUpdate);
}

window.requestAnimationFrame(PlayerUpdate);
