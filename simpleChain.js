/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const SHA256 = require('crypto-js/sha256');
const block = require('./block');
const leveldb = require('./levelDBSandbox');

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){

    this.getBlockHeight().then((height) =>{

      this.blockHeight = height;
      if (height === -1){
        this.addBlock(new block("First block in the chain - Genesis block") );
        console.log('Genesis block');
      }
    }).catch(error => {console.log(error); });

  }

  async getBlockHeight() {
    return await leveldb.getBlockHeightFromLevelDB();
  }

  async getBlock(blockHeight){
    // return object as a single string
    return JSON.parse(await leveldb.getBlockFromLevelDB(blockHeight)  );
  }

  async addBlock(newBlock){
    let resultAddBlock = '';
    const height = parseInt(await this.getBlockHeight());

    // Block height
    newBlock.height = this.blockHeight + 1;
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // previous block hash
    if( newBlock.height > 0){
      const previousBlock = await this.getBlock(height);
      newBlock.previousBlockHash = previousBlock.hash;

      console.log("Previous hash: "+ newBlock.previousBlockHash);
    }

    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    console.log("New hash: " + newBlock.hash);

    this.blockHeight = newBlock.height;
    // Adding block object to chain
    await leveldb.addBlockToLevelDB(newBlock.height, JSON.stringify(newBlock)).then( (result) => {
      resultAddBlock = result;
    }).catch( error => {resultAddBlock = error; });

    return resultAddBlock;
  }

  async validateBlock(blockHeight){

    let block = await this.getBlock(blockHeight);

    let blockHash = block.hash;

    block.hash = '';

    let validBlockHash = SHA256(JSON.stringify(block)).toString();
    if (blockHash === validBlockHash) {
      return true;
    } else {
      console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
      return false;
    }
  }
  // Validate blockchain
  async validateChain(){

    let errorLog = [];
    let previousHash = '';
    let isBlockValid = false;

    const height = await this.getBlockHeight();

    console.log('blockHeight - ' + height);

    for (let i = 0; i <= height; i++) {

      let block = await this.getBlock(i);

      isBlockValid = await this.validateBlock(block.height);

      if(!isBlockValid){
        errorLog.push(i);
      }

      if (block.previousBlockHash !== previousHash){
        errorLog.push(i);
      }

      previousHash = block.hash;

      if(this.blockHeight === block.height){
        if (errorLog.length>0) {
          console.log('Block errors = ' + errorLog.length);
          console.log('Blocks: '+errorLog);
        } else {
          console.log('No errors detected');
        }

      }
    }
  }
}

let myBlockChain = new Blockchain();

(function theLoop(i){
    setTimeout(() => {
      myBlockChain.addBlock(new block('Test block')).then((result) =>{
        console.log(result);
        i++;
        if (i < 10) theLoop(i);
      })
    }, 1000)
})(0)

setTimeout(() => myBlockChain.validateChain(), 20000 )
