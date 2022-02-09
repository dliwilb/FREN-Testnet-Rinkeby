console.log("frens.js loaded");

let isWalletConnected = false;
let isNetworkConnected = false;
// const nftContractAddress = '0xC2CFD6dFbC52319f8F34D056F10EB49016925d27'; // v1.0
const nftContractAddress = '0x69F511EAca22eD5c5f48ba3d5D3D0442340948c9'; // v2.2
document.getElementById('nft-contract-address').value = nftContractAddress;
document.getElementById('link-to-nft-contract-address').href = 'https://rinkeby.etherscan.io/address/' + nftContractAddress;

async function onConnect() {

    await connectWallet();
    if (isWalletConnected == true){
        await switchNetwork();
        if (isNetworkConnected == true){
            await getMintFee();
        }
    }

}

async function connectWallet() {

    if (window.ethereum) {
        try {
            const connectedAccount = await window.ethereum.request({ method: 'eth_requestAccounts' });
            isWalletConnected = true;
            document.getElementById('connected-address').value = connectedAccount;
            logToConsoleAndPage('log: wallet connected');
        }
        catch (error) {
            if (error.code === 4001) {
                logToConsoleAndPage('log: connection rejected by user');
            }

            logToConsoleAndPage('log: cannot connect to wallet');
        }
    }

}

async function switchNetwork(){
 
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x4' }],
        });

        isNetworkConnected = true;
        logToConsoleAndPage('log: switched to Testnet Rinkeby');
    }
    catch (error) {
        if (error.code === 4001) {
            logToConsoleAndPage('log: user rejected network switch');
        }

        logToConsoleAndPage('log: cannot switch to Testnet Rinkeby');
        console.log(isWalletConnected);
        console.log(isNetworkConnected);
    }    
}

function logToConsoleAndPage(message){
    console.log(message);
    document.getElementById('js-log').innerHTML = message;
}

async function getMintFee(){

    if (isWalletConnected == true && isNetworkConnected == true){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(nftContractAddress, frensAbi, signer);
        
        const nftMintFee = await contract.mintFee();
        document.getElementById('nft-mint-fee').value = ethers.utils.formatEther(nftMintFee);
    }
    else{
        alert("請先連結錢包並切換至 Rinkeby 測試網");
    }
}

async function pinFileToIPFS() {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    let file = document.getElementById('file-to-pin').files[0];
    console.log(file);

    let data = new FormData();
    data.append('file', file);

    let pinataApiKey = document.getElementById('pinata-api-key').value;
    let pinataSecretApiKey = document.getElementById('pinata-secret-api-key').value;

    return axios.post(url,
        data,
        {
            headers: {
                'Content-Type': `multipart/form-data; boundary= ${data._boundary}`,
                'pinata_api_key': pinataApiKey,
                'pinata_secret_api_key': pinataSecretApiKey
            }
        }
    ).then(function (response) {
        console.log(response.data);
        document.getElementById('nft-image-ipfs').value = "ipfs://" + response.data.IpfsHash;
        document.getElementById('file-preview-https').innerHTML = `&nbsp;&#10230&nbsp;<a href="https://ipfs.io/ipfs/${response.data.IpfsHash}" target="_blank">檔案預覽 https://ipfs.io/ipfs/${response.data.IpfsHash}</a>`;

    }).catch(function (error) {
        console.log(error);
    });

}

async function pinJSONToIPFS() {

    let objectName = document.getElementById('nft-name').value;
    let objectDescription = document.getElementById('nft-description').value;
    let objectIPFS = document.getElementById('nft-image-ipfs').value;

    const JSONBody = {
        pinataMetadata: {
            "name": objectName + " [meta]"
        },
        pinataContent: {
            "name": objectName,
            "description": objectDescription,
            "image": objectIPFS
        }
    };


    let pinataApiKey = document.getElementById('pinata-api-key').value;
    let pinataSecretApiKey = document.getElementById('pinata-secret-api-key').value;

    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    return axios
        .post(url, JSONBody, {
            headers: {
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey
            }
        })
        .then(function (response) {
            console.log(response.data);
            document.getElementById('nft-meta-ipfs').value = "ipfs://" + response.data.IpfsHash;
            document.getElementById('meta-preview-https').innerHTML = `&nbsp;&#10230&nbsp;<a href="https://ipfs.io/ipfs/${response.data.IpfsHash}" target="_blank">Meta 預覽 https://ipfs.io/ipfs/${response.data.IpfsHash}</a>`;
        })
        .catch(function (error) {
            console.log(error);
        });
    
}

async function mintNFT() {
	const provider = new ethers.providers.Web3Provider(window.ethereum);
	const signer = provider.getSigner();

    let contract = new ethers.Contract(nftContractAddress, frensAbi, signer);
		
	let mintTo = document.getElementById('nft-recipient-address').value;
	let tokenUri = document.getElementById('nft-meta-ipfs').value;
	
    let transaction = await contract.createToken(mintTo, tokenUri, 
        { value: ethers.utils.parseEther(document.getElementById('nft-mint-fee').value) });
    let receipt = await transaction.wait();
    let mintedTokenId = receipt.events[0].args[2].toNumber();
    console.log(receipt);

    document.getElementById('tx-info').value = mintedTokenId;
	
}

function toOneself() {
    document.getElementById('nft-recipient-address').value = document.getElementById('connected-address').value;
}