// let isGettingTokenOwner = false;

const nftContractAddress = '0x69F511EAca22eD5c5f48ba3d5D3D0442340948c9'; // v2.2

async function readContractStatVar(){
    console.log('Reading contract state variables...');
    document.getElementById('div-contract-info').innerHTML = 'Loading...';

    await connectWallet();
    await switchNetwork();

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const nftContract = new ethers.Contract(nftContractAddress, frensAbi, provider);

    let listContent = '';
    // const nft_tokenIds = await nftContract._tokenIds();
    // console.log(Number(nft_tokenIds));

    listContent += "<li>_tokenIds: " + await nftContract._tokenIds() + "</li>"; 
    listContent += "<li>isAddUserAllowed: " + await nftContract.isAddUserAllowed() + "</li>";
    listContent += "<li>mintFee: " + await nftContract.mintFee() + "wei </li>";
    listContent += "<li>whitelistFee: " + await nftContract.whitelistFee() + "wei </li>";
    listContent += "<li>whitelistWaiver: " + await nftContract.whitelistWaiver() + "</li>";
    listContent += "<li>name: " + await nftContract.name() + "</li>";
    listContent += "<li>symbol: " + await nftContract.symbol() + "</li>";
    listContent += "<li>nftNameSymbolHardcoded: " + await nftContract.nftNameSymbolHardcoded() + "</li>";
    listContent += "<li>owner: " + await nftContract.owner() + "</li>";
    listContent += "<li>treasuryAddress: " + await nftContract.treasuryAddress() + "</li>";


    document.getElementById('div-contract-info').innerHTML = listContent;

}

async function fetchJSON(api_uri) {
	let response = await fetch(api_uri);
	
	if (!response.ok) {
	    throw new Error(`HTTP error! status: ${response.status}`);
	}
	
	let myJSON = await response.json();
	
	return await myJSON;
}