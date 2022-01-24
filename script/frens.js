console.log("frens.js loaded");

async function onConnect() {

    await connectWallet();
    await getMintFee();

}

async function connectWallet() {
    
    window.ethereum.request( {
		method: 'eth_requestAccounts',
	} )
    .then( ( response ) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);

		document.getElementById('connected-address').value = response[0];

		window.ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: '0x4' }],
		})
	} );

    console.log( 'Is MetaMask? ' + ethereum.isMetaMask);

}

async function getMintFee(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const nftContractAddress = document.getElementById('nft-contract-address').value;
    const contract = new ethers.Contract(nftContractAddress, frensAbi, signer);
    
    const nftMintFee = await contract.mintFee();
    document.getElementById('nft-mint-fee').value = ethers.utils.formatEther(nftMintFee);
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
        })
        .catch(function (error) {
            console.log(error);
        });
    
}

async function mintNFT() {
	const provider = new ethers.providers.Web3Provider(window.ethereum);
	const signer = provider.getSigner();

	let nftContractAddress = document.getElementById('nft-contract-address').value;
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