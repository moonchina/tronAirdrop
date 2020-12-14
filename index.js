const TronWeb = require('tronweb')
const fs = require('fs')
const {BigNumber} = require('@ethersproject/bignumber')
// const { transformCsvToArray, isCsvFormatCorrect } = require('./csv.js')

const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.trongrid.io");
const solidityNode = new HttpProvider("https://api.trongrid.io");
const eventServer = new HttpProvider("https://api.trongrid.io");

// const fullNode = new HttpProvider("https://api.shasta.trongrid.io");
// const solidityNode = new HttpProvider("https://api.shasta.trongrid.io");
// const eventServer = new HttpProvider("https://api.shasta.trongrid.io");
const privateKey = "";
const tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);


function transformCsvToArray (path) {
  const fileContent = fs.readFileSync(path, { encoding: 'utf8' })
  return fileContent.split('\n').map(r => r.split(','))
}

function isCsvFormatCorrect (arr) {
  const amountRegExp = /^[0-9]+$/
  const addressCheck = (address) =>
    address.length === 40 || address.length === 34
  return arr.every((row, i) => {
    if (!addressCheck(row[0]) || !amountRegExp.test(row[1])) {
      console.log(
        `Error checking CSV content. Line ${i}, ${JSON.stringify(row)}`
      )
      return false
    }
    return true
  })
}

const csvContent = transformCsvToArray("./file/file1.csv")
const checkCsvContent = isCsvFormatCorrect(csvContent)


if (!checkCsvContent) {
    console.error('CSV content is incorrect')
    process.exit(0)
}


async function triggerSmartContract(row) {
    const trc20ContractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";//contract address

    try {
        let contract = await tronWeb.contract().at(trc20ContractAddress);
        //Use send to execute a non-pure or modify smart contract method on a given smart contract that modify or change values on the blockchain.
        // These methods consume resources(bandwidth and energy) to perform as the changes need to be broadcasted out to the network.
        let val =  BigNumber.from(row[1]);
        // let val =  BigNumber.from(row[1]).mul(BigNumber.from(10).pow(6));
        await contract.transfer(
            row[0], //address _to
            val//amount
        ).send({
            feeLimit: 2000000
        }).then(output => {console.log('- Output:', output,row[0],val.toString(), '\n');});
        await sleep(3000);
        // console.log('result: ', result);
    } catch(error) {
        console.error("trigger smart contract error",error)
    }
}


//  triggerSmartContract();

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

csvContent.map(row => {
    triggerSmartContract(row)
})