# blkchn
Blockchain

# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM install to download the dependencies we need for this project
```
npm install
```

## Testing

To test code:
1. Open a command prompt or shell terminal after install node.js.
2. Enter a node session, also known as REPL (Read-Evaluate-Print-Loop).
3. If you are running for the second time, go to the folder that you are running this example and delete the folder - chaindata
```
node
```
4. Copy and paste your code into your node session
5. Instantiate blockchain with blockchain variable
```
let blockchain = new Blockchain();
```
6. Generate 10 blocks using a for loop
```
(function theLoop (i) 
  {setTimeout(function () {
    blockchain.addBlock(new Block('Testing data'));
    if (--i) theLoop(i);
  }, 100);
})(10);
```
7. Validate blockchain
```
blockchain.validateChain();
```
8. Induce errors by changing block data
```
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
```
9. Validate blockchain. The chain should now fail with blocks 2, 4, 5, 7 and 9.
```
myBlockChain.validateChain();
```

