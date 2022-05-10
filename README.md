# gala-subgraph

A subgraph of gala games and gala music NFTs that have been minted so far and the accounts that hold them, for the ethereum mainnet.

Contents
========

 * [Why?](#why)
 * [Prerequisites](#prerequisites)
 * [Installation](#installation)
 * [Build and deploy](#build-and-deploy)
 

 ### Why?
---
 I wanted a tool that allows people to track NFTs being minted in the gala ecosystem. 

 ### Prerequisites
 ---
 Some understanding of how ethereum wallets and web3 works. 

 The subgraph is currently being developed and deployed through [The Graph's](https://thegraph.com) [Subgraph Studio](https://thegraph.com/studio/), so that has to be setup first. 

 You will need to have [Node JS](https://nodejs.org/) installed. I've used v16.15.0.

 ### Installation
 ---
 To install this clone the repo, and run `npm install` at the root of the repo folder. This will install:

 * [@openzeppelin/subgraphs](https://www.npmjs.com/package/@openzeppelin/subgraphs)
 * [@graphprotocol/graph-cli](https://www.npmjs.com/package/@graphprotocol/graph-cli)
 * [@graphprotocol/graph-ts](https://www.npmjs.com/package/@graphprotocol/graph-ts)


 ### Build and deploy
 ---
 To build the subgraph run 

 ```
 npx graph-compiler \
  --config townstar.json \
  --include node_modules/@openzeppelin/subgraphs/src/datasources \
  --export-schema \
  --export-subgraph
  ```
 To deploy the subgraph to Subgraph Studio run
 ```
npx graph-cli codegen src/townstar.subgraph.yaml
npx graph-cli build src/townstar.subgraph.yaml
npx graph-cli deploy --studio <your-subgraph-name> src/townstar.subgraph.yaml
  ```

_The build and deploy instructions are based on the [Open Zeppelin docs](https://docs.openzeppelin.com/subgraphs/0.1.x/generate)._

 