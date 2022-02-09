// let isGettingTokenOwner = false;

const nftContractAddress = '0x69F511EAca22eD5c5f48ba3d5D3D0442340948c9'; // v2.2

async function readContractStatVar(){
    console.log('Reading contract state variables...');
    document.getElementById('div-contract-info').innerHTML = 'Loading...';

    await connectWallet();
    await switchNetwork();

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const nftContract = new ethers.Contract(nftContractAddress, frensAbi, provider);

    const nft_tokenIds = await nftContract._tokenIds();
    console.log(Number(nft_tokenIds));

}

async function fetchJSON(api_uri) {
	let response = await fetch(api_uri);
	
	if (!response.ok) {
	    throw new Error(`HTTP error! status: ${response.status}`);
	}
	
	let myJSON = await response.json();
	
	return await myJSON;
}