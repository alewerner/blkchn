/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/
const level = require('level');
const chainDB = './chaindata';
const bd = level(chainDB);

addBlockToLevelDB = function(key,value){

  return new Promise((resolve, reject) => {
    bd.put(key, value, (error) =>{
      if (error){
        reject(error);
      }else{
        resolve('Bloco Adicionado'+key);
      }
    })
  })
}

getBlockHeightFromLevelDB = function(){
  return new Promise((resolve, reject) =>{
    let height = -1
    bd.createReadStream().on('data', (data) =>{
      height++
    }).on('error', (error) => {
      reject(error)
    }).on('close', () => {
      resolve(height)
    })
  })
}

getBlockFromLevelDB = function( key ) {
  return new Promise((resolve, reject) => {
    bd.get( key, (error, value) =>{
      if (error){
        reject(error)
      }
      resolve(value)
    })
  })
}

module.exports ={
  getBlockFromLevelDB,
  getBlockHeightFromLevelDB,
  addBlockToLevelDB
}
