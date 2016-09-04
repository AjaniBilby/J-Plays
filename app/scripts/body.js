class Body{
  constructor(){
    this.onLoadFunctions = [];
    this.bodyIsReady = false;
  }

  get onLoad(){
    return null;
  }

  set onLoad(value){
    if (!this.bodyIsReady){
      this.onLoadFunctions.push(value);
    }else{
      value();
    }
  }
}

Body.prototype.ActivateLoad = function(){
  this.bodyIsReady = true;
  for (let item of this.onLoadFunctions){
    if (typeof(item) == 'function'){
      item();
    }
  }
};

var body = new Body();
