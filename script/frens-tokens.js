let _tokenIds = 0;
const provider = new ethers.providers.JsonRpcProvider('https://rinkeby.infura.io/v3/2c1d58028d4343dbb2680897c28b8bc2');
const nftContractAddress = '0x69F511EAca22eD5c5f48ba3d5D3D0442340948c9'; // v2.2
const nftContract = new ethers.Contract(nftContractAddress, frensAbi, provider);



const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});

if (params["t"] !== null){
	document.getElementById('input-token-id').value = params["t"];
    showToken();
}




async function selectRandom() {
    await getTokenIds();
    document.getElementById('input-token-id').value = Math.floor(Math.random() * _tokenIds);
    await showToken();
}


async function getTokenIds() {
    _tokenIds = await nftContract._tokenIds();
}


async function showToken() {
    // const provider = ethers.getDefaultProvider(4);
    console.log('Loading token info...');

    // const provider = new ethers.providers.JsonRpcProvider('https://rinkeby.infura.io/v3/2c1d58028d4343dbb2680897c28b8bc2');
    
    // const nftContractAddress = '0x69F511EAca22eD5c5f48ba3d5D3D0442340948c9'; // v2.2
    // const nftContract = new ethers.Contract(nftContractAddress, frensAbi, provider);

    // const _tokenIds = await nftContract._tokenIds();

    // console.log(Number(_tokenIds));

    await getTokenIds();

    const tokenId = document.getElementById('input-token-id').value;

    document.getElementById('div-token-info').innerHTML = '';

    if ( tokenId <= Number(_tokenIds) ){

        const tokenOwner = await nftContract.ownerOf(tokenId);
        const tokenOwnerShort = tokenOwner.substring(0, 6) + '...' + tokenOwner.substring(tokenOwner.length - 4);

        let tokenURI = await nftContract.tokenURI(tokenId);
        const foundIPFSinURI = tokenURI.match(/ipfs:\/\/(\w+)/);
        if (foundIPFSinURI[1] != ''){
            tokenURI = 'https://ipfs.io/ipfs/' + foundIPFSinURI[1];
        }

        let nftJSON = await fetchJSON(tokenURI);
        const foundIPFSinJSONImage = nftJSON.image.match(/ipfs:\/\/(\w+)/);
        if (foundIPFSinJSONImage[1] != ''){
            nftJSON.image = 'https://ipfs.io/ipfs/' + foundIPFSinJSONImage[1];
        }
        document.getElementById('div-token-info').innerHTML +=
        `
        <div class="nft-item">
            <img class="nft-image" src="${nftJSON.image}">
            <div class="nft-token-info">
                fren #${tokenId}&nbsp;&nbsp;owned by&nbsp;&nbsp;<a class="creator" href="frens.html?a=${tokenOwner}">${tokenOwnerShort}</a>
            </div>
            <div class="nft-token-info">
                "${nftJSON.name}"
            </div>
            <div class="nft-token-info">
                ${nftJSON.description}
            </div>
        </div>
        `;
        // `<img class="nft-image" src="${nftJSON.image}">`;
        

        // const eventFilter = nftContract.filters.tokenCreated(null, tokenURI, null);
        // const events = await nftContract.queryFilter(eventFilter);
        // error: cannot filter non-indexed parameters
        // --> update smart contract in future deployments: index also tokenId and tokenURI
        // for (let i = events.length-1; i >= 0; i--) {
        //     const newItemId = events[i].args[0];
        //     const createdBy = events[i].args[2];

        //     document.getElementById('div-token-info') += newItemId + `(${createdBy}), `;

        // }

    }



}


async function fetchJSON(api_uri) {
	let response = await fetch(api_uri);
	
	if (!response.ok) {
	    throw new Error(`HTTP error! status: ${response.status}`);
	}
	
	let myJSON = await response.json();
	
	return await myJSON;
}
