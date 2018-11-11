/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256')
/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level')
const chainDB = './chaindata'
const bd = level(chainDB)

//instead of

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
| Autor Alexandre                              |
|  ===============================================*/

class Block{
  constructor(data){
    this.hash = "",
    this.height = 0,
    this.body = data,
    this.time = 0,
    this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    this.blockHeight;
    console.log('blockHeight: '+ this.blockHeight)

    this.getBlockHeight().then((height) =>{

      this.blockHeight = height
      if (height === -1){
        this.addBlock(new Block("First block in the chain - Genesis block") )
        console.log('Genesis block')
      }
    }).catch(error => {console.log(error) })

  }

  // Add new block
  async addBlock(newBlock){
    var resultAddBlock = '';
    const height = parseInt(await this.getBlockHeight())

    // Block height
    newBlock.height = this.blockHeight + 1
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3)
    // previous block hash
    if( newBlock.height > 0){
      const previousBlock = await this.getBlock(height)
      newBlock.previousBlockHash = previousBlock.hash

      console.log("Previous hash: "+ newBlock.previousBlockHash)
    }

    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    console.log("New hash: " + newBlock.hash)

    this.blockHeight = newBlock.height;
    // Adding block object to chain
    //this.chain.push(newBlock);
    await this.addBlockToLevelDB(newBlock.height, JSON.stringify(newBlock)).then( (result) => {
      resultAddBlock = result
    }).catch( error => {resultAddBlock = error; });

      return resultAddBlock;
  }

  addBlockToLevelDB(key,value){

    return new Promise((resolve, reject) => {
      bd.put(key, value, (error) =>{
        if (error){
          reject(error)
        }
        //console.log('Bloco adicionado - '+key)
        resolve('Bloco Adicionado'+key)
      })
    })
  }

  async getBlockHeight() {
    return await this.getBlockHeightFromLevelDB()
  }

  // Get block height
  getBlockHeightFromLevelDB(){
    return new Promise((resolve, reject) =>{
      var height = -1
      bd.createReadStream().on('data', (data) =>{
        height++
      }).on('error', (error) => {
        reject(error)
      }).on('close', () => {
        resolve(height)
      })
    })
  }

  // get block
  async getBlock(blockHeight){
    // return object as a single string
    //console.log('passou blockHeight' + blockHeight )
    return JSON.parse(await this.getBlockFromLevelDB(blockHeight)  );
  }

  getBlockFromLevelDB( key ) {
    return new Promise((resolve, reject) => {
      bd.get( key, (error, value) =>{
        if (error){
          reject(error)
        }
        resolve(value)
      })
    })
  }

  // validate block
  async validateBlock(blockHeight){
    // get block object
    let block = await this.getBlock(blockHeight);
    //console.log('carregou blockHeight' + blockHeight )
    //console.log(block.toString())
    // get block hash
    let blockHash = block.hash;
    //console.log('blockHash - ' + blockHash);
    // remove block hash to test block integrity
    block.hash = '';
    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString();
    //console.log('validBlockHash - ' + validBlockHash);
    // Compare
    if (blockHash === validBlockHash) {
      return true;
    } else {
      //console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
      return false;
    }
  }

  // Validate blockchain
  async validateChain(){

    let errorLog = [];
    let previousHash = '';
    let isBlockValid = false;

    const height = await this.getBlockHeightFromLevelDB()

    console.log('blockHeight - ' + height);

    for (let i = 0; i < height; i++) {
      //this.getBlock(i).then((block) =>{
        // validate block
        let block = await this.getBlock(i);

        //console.log('getblockHeight - ' + block.height);
        isBlockValid = await this.validateBlock(block.height)

        if(!isBlockValid){
          errorLog.push(i)
         //console.log('Block #'+height+' invalido');
        }

        if (block.previousBlockHash !== previousHash){
          errorLog.push(i)
          //console.log('Block #'+i+' invalid hash:\n'+previousHash+'<>'+block.previousBlockHash);
        }

        previousHash = block.hash

        if(i === (height -1)){
        //if(this.blockHeight === block.height){
          if (errorLog.length>0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: '+errorLog);
          } else {
            console.log('No errors detected');
          }
        }
      //})


    }

  }

}

let myBlockChain = new Blockchain();

(function theLoop(i){
  setTimeout(() => {
    let blockTest = new Block("Teste Block "+ (i+1))
    myBlockChain.addBlock(blockTest).then((result) =>{
      console.log(result)
      i++
      if (i < 10) theLoop(i)
    })
  }, 1000)
})(0)

setTimeout(() => console.log('validate blockchain'),20000 );
setTimeout(() => myBlockChain.validateChain(), 20000 );

(function induceErrors() {
  let inducedHashErrorBlocks = [2,4,7];
  for (let i = 0; i < inducedHashErrorBlocks.length; i++) {
    myBlockChain.getBlock(inducedHashErrorBlocks[i]).then(block => {
      block.data = 'induced chain error';
      myBlockChain.addBlockToLevelDB(block.height, JSON.stringify(block));
    });
  }

  let inducedLinkErrorBlocks = [5, 9];
  for (let i = 0; i < inducedLinkErrorBlocks.length; i++) {
    myBlockChain.getBlock(inducedLinkErrorBlocks[i]).then(block => {
      block.previousBlockHash = 'incorrecthash';
      myBlockChain.addBlockToLevelDB(block.height, JSON.stringify(block));
    });
  }
})();

setTimeout(() => myBlockChain.validateChain(), 20000 );
