ObjectManager = function(){};

ObjectManager.prototype.getList = function(obj1, obj2, skipableRecursive){
  if (this.isFunction(obj1) || this.isFunction(obj2)){
    throw 'Invalid argument. Function given, object expected.';
  }
  if (this.isValue(obj1) || this.isValue(obj2)){
    return this.compareValues(obj1, obj2);
  }

  var diff = {};

  for (let key in obj1){
    if (this.isValue(obj1)){
      diff[key] = this.compareValues(obj1[key], obj2[key]);
    }else{
      //if it is an array or object
      if (!this.isValue(obj2[key])){
        //if they are both objects/arrays
        diff[key] = this.getList(obj1[key], obj2[key]);
      }else if (this.isObject(obj1[key])){
        if (this.isObject(obj2[key])){
          if (skipableRecursive){
            //Check if the two objects are completely the same
            if (JSON.stringify(obj1[key]) == JSON.stringify(obj1[key])){
              //if so then that part is equal
              diff[key] = "equal";
              continue;
            }
          }else{
            diff[key] = this.getList(obj1[key], obj2[key], skipableRecursive);
            continue;
          }
        }else{
          if (skipableRecursive){
            diff[key] = "updated";
            continue;
          }else{
            diff[key] = this.getList(obj1[key], obj2[key], skipableRecursive);
            continue;
          }
        }
      }else{
        if (skipableRecursive){
          diff[key] = "updated";
          continue;
        }else{
          diff[key] = this.getList(obj1[key], obj2[key], skipableRecursive);
          continue;
        }
      }
    }
    continue;
  }

  for (let key in obj2){
    if (this.isValue(obj2)){
      diff[key] = this.compareValues(obj2[key], obj1[key]);
    }else{
      //if it is an array or object
      if (!this.isValue(obj1[key])){
        //if they are both objects/arrays
        diff[key] = this.getList(obj2[key], obj1[key]);
      }else if (this.isObject(obj2[key])){
        if (this.isObject(obj1[key])){
          if (skipableRecursive){
            //Check if the two objects are completely the same
            if (JSON.stringify(obj2[key]) == JSON.stringify(obj2[key])){
              //if so then that part is equal
              diff[key] = "equal";
              continue;
            }
          }else{
            diff[key] = this.getList(obj2[key], obj1[key], skipableRecursive);
            continue;
          }
        }else{
          if (skipableRecursive){
            diff[key] = "updated";
            continue;
          }else{
            diff[key] = this.getList(obj2[key], obj1[key], skipableRecursive);
            continue;
          }
        }
      }else{
        if (skipableRecursive){
          diff[key] = "updated";
          continue;
        }else{
          diff[key] = this.getList(obj2[key], obj1[key], skipableRecursive);
          continue;
        }
      }
    }
    continue;
  }

  return diff;
};

ObjectManager.prototype.passNew = function(obj1, obj2, skipableRecursive){
  var diff = this.getList(obj1, obj2, skipableRecursive);

  var output = {};

  for (let key in diff){
    switch (diff[key]) {
      case "updated":
        output[key] = obj2[key];
        break;
      case "equal":
        break;
      case "deleted":
        output[key] = undefined;
        break;
      case "new":
        output[key] = obj2[key];
        break;
      default:
        //Is array or object?
        if (!this.isValue(diff[key])){
          output[key] = this.passNew(obj1[key], obj2[key], skipableRecursive);
        }
    }
  }

  return output;
};

ObjectManager.prototype.compareValues = function(original, current){
  //Equal?
  if (original == current){
    return 'equal';
  }
  //Has the item added?
  if (typeof(original) == 'undefined' && typeof(current) != 'undefined'){
    return 'new';
  }
  //Has the item been removed?
  if (typeof(current) == 'undefined' && typeof(original) != 'undefined'){
    return 'deleted';
  }
  //Changed?
  if (current != original){
    return 'updated';
  }
  //else
  return 'equal';
};

ObjectManager.prototype.isFunction = function(obj){
  return {}.toString.apply(obj) === '[object Function]';
};

ObjectManager.prototype.isObject = function(obj){
  return {}.toString.apply(obj) === '[object Object]';
};

ObjectManager.prototype.isArray = function(obj){
  return {}.toString.apply(obj) === '[object Array]';
};

ObjectManager.prototype.isValue  = function(obj){
  return !this.isObject(obj) && !this.isArray(obj);
};


module.exports = new ObjectManager();
