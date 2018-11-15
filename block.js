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

module.exports = Block;
