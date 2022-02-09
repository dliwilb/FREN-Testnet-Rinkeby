// let isGettingTokenOwner = false;

// const nftContractAddress = '0x69F511EAca22eD5c5f48ba3d5D3D0442340948c9'; // v2.2
// document.getElementById('nft-contract-address').value = nftContractAddress;

const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});
console.log(params);

if (params["nft_contract_address"] !== null && params["token_id"] !== null){
    document.getElementById('nft-contract-address').value = params["nft_contract_address"];
	document.getElementById('nf-token-id').value = params["token_id"];
    getOwner0xAddress();
}


async function getOwner0xAddress(){
    console.log('New token owner info requested.');
    document.getElementById('div-nft-info').innerHTML = '';
    document.getElementById('div-nft-transfer').style.display = 'none';
    document.getElementById('div-confirm-transfer').style.display = 'none';

    await connectWallet();
    await switchNetwork();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const provider = new ethers.providers.JsonRpcProvider('https://rinkeby.infura.io/v3/2c1d58028d4343dbb2680897c28b8bc2');
    const nftContractAddress = document.getElementById('nft-contract-address').value;
    const tokenId = document.getElementById('nf-token-id').value;
    // console.log(tokenId);

    document.getElementById('nft-owner').value = '';
    if( ethers.utils.isAddress(nftContractAddress) ){
        document.getElementById('nft-owner').placeholder = '';

        if ( tokenId != ''){
            const nftContract = new ethers.Contract(nftContractAddress, ERC721Abi, provider);
            // const nameOfNft = await nftContract.name();
            const ownerOfNft = await nftContract.ownerOf(tokenId);
            document.getElementById('nft-owner').value = ownerOfNft;

            let nftURI = await nftContract.tokenURI(tokenId);
            const foundIPFSinURI = nftURI.match(/ipfs:\/\/(\w+)/);
            if (foundIPFSinURI[1] != ''){
                nftURI = 'https://ipfs.io/ipfs/' + foundIPFSinURI[1];
            }
            
            let nftJSON = await fetchJSON(nftURI);
            const foundIPFSinJSONImage = nftJSON.image.match(/ipfs:\/\/(\w+)/);
            if (foundIPFSinJSONImage[1] != ''){
                nftJSON.image = 'https://ipfs.io/ipfs/' + foundIPFSinJSONImage[1];
            }


            document.getElementById('div-nft-info').innerHTML = 
                `<img class="assets" src="${nftJSON.image}">`;

            
            // console.log(connected0xAccount);
            if (ownerOfNft == ethers.utils.getAddress(connected0xAccount.toString())){
                document.getElementById('nft-owner').value += '    (You)';

                document.getElementById('div-nft-transfer').style.display = 'block';
            }
            
        }
        else {
            document.getElementById('nft-owner').placeholder = 'Invalid token ID';
        }
    }
    else {
        document.getElementById('nft-owner').placeholder = 'Invalid NFT contract address';
    };

}

async function onTransfer() {
    document.getElementById('div-nft-transfer').style.display = 'none';
    document.getElementById('div-confirm-transfer').style.display = 'block';
}

async function confirmTransfer() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const nftContractAddress = document.getElementById('nft-contract-address').value;
    const tokenId = document.getElementById('nf-token-id').value;
    const nftContract = new ethers.Contract(nftContractAddress, ERC721Abi, signer);
    const transferReceipt = await nftContract.transferFrom(ethers.utils.getAddress(connected0xAccount.toString()), document.getElementById('recipient-address').value, tokenId);
    console.log(transferReceipt);
}

async function fetchJSON(api_uri) {
	let response = await fetch(api_uri);
	
	if (!response.ok) {
	    throw new Error(`HTTP error! status: ${response.status}`);
	}
	
	let myJSON = await response.json();
	
	return await myJSON;
}