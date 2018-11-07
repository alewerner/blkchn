# blkchn
Blockchain

Blockchain Data
Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites
Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

Configuring your project
Use NPM to initialize your project and create package.json to store project dependencies.
npm init
Install crypto-js with --save flag to save dependency to our package.json file
npm install crypto-js --save
Install level with --save flag
npm install level --save
Testing
To test code:

Open a command prompt or shell terminal after install node.js.
Enter a node session, also known as REPL (Read-Evaluate-Print-Loop).
node
Copy and paste your code into your node session
Instantiate blockchain with blockchain variable
let blockchain = new Blockchain();
Generate 10 blocks using a for loop
(function theLoop (i) 
  {setTimeout(function () {
    blockchain.addBlock(new Block('Testing data'));
    if (--i) theLoop(i);
  }, 100);
})(10);
Validate blockchain
blockchain.validateChain();
Induce errors by changing block data
(function induceErrors() {
  let inducedHashErrorBlocks = [2,4,7];
  for (let i = 0; i < inducedHashErrorBlocks.length; i++) {
    blockchain.getBlock(inducedHashErrorBlocks[i]).then(block => {
      block.data = 'induced chain error';
      addLevelDBData(block.height, JSON.stringify(block));
    });
  }

  let inducedLinkErrorBlocks = [5, 9];
  for (let i = 0; i < inducedLinkErrorBlocks.length; i++) {
    blockchain.getBlock(inducedLinkErrorBlocks[i]).then(block => {
      block.previousBlockHash = 'incorrecthash';
      addLevelDBData(block.height, JSON.stringify(block));
    });
  }
})();
Validate blockchain. The chain should now fail with blocks 2, 4, 5, 7 and 9.
blockchain.validateChain();
