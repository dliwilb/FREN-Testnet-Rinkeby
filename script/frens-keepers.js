const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});

if (params["a"] !== null){
	document.getElementById('keeper-address').value = params["a"];
    onShowKept();
}


function onShowKept() {
    const keeperAddress = document.getElementById('keeper-address').value;
    if ( ethers.utils.isAddress(keeperAddress) ){
        // document.getElementById('div-frens-kept').innerHTML = 'Loading...';
        document.getElementById('div-frens-kept').innerHTML = '';
        showKept(keeperAddress);
    } else {
        document.getElementById('div-frens-kept').innerHTML = 'Please enter a valid keeper address.';
        return 0;
    }
}

async function showKept(keeperAddress) {
    // const provider = ethers.getDefaultProvider(4);
    const provider = new ethers.providers.JsonRpcProvider('https://rinkeby.infura.io/v3/2c1d58028d4343dbb2680897c28b8bc2');

    const nftContractAddress = '0x69F511EAca22eD5c5f48ba3d5D3D0442340948c9'; // v2.2
    const nftContract = new ethers.Contract(nftContractAddress, frensAbi, provider);

    const eventFilterReceived = nftContract.filters.Transfer(null, keeperAddress, null);
    const eventsReceived = await nftContract.queryFilter(eventFilterReceived);
    // console.log(eventsReceived);

    const eventFilterSent = nftContract.filters.Transfer(keeperAddress, null, null);
    const eventsSent = await nftContract.queryFilter(eventFilterSent);
    // console.log(eventsSent);

    const keeperAddressShort = keeperAddress.substring(0, 6) + '...' + keeperAddress.substring(keeperAddress.length - 4);

    let ownedCandidates = {};
    for (let i = 0; i < eventsReceived.length; i++){
        const tokenId = eventsReceived[i].args[2];
        ownedCandidates[String(tokenId)] = {};
        ownedCandidates[String(tokenId)]["blockNumber"] = eventsReceived[i].blockNumber;
        ownedCandidates[String(tokenId)]["owned"] = true;
        ownedCandidates[String(tokenId)]["ownedIndex"] = i;
    }
    for (let i = 0; i < eventsSent.length; i++){
        const tokenId = eventsSent[i].args[2];

        if ( eventsSent[i].blockNumber >= ownedCandidates[String(tokenId)]["blockNumber"]){
            ownedCandidates[String(tokenId)]["owned"] = false;
        }
    }
    // console.log(ownedCandidates);
    // console.log(Object.keys(ownedCandidates));

    let arrayTokenId = Object.keys(ownedCandidates);
    let ownedIndex = 0;

    document.getElementById('div-keeper-info').innerHTML = `<h3>frens kept by ${ethers.utils.getAddress(keeperAddress.toString())}...</h3>`;


    for (let i = 0; i < arrayTokenId.length; i++) {
        if (ownedCandidates[String(arrayTokenId[i])]["owned"] === true) {

            ownedIndex++;
            let nftURI = await nftContract.tokenURI(arrayTokenId[i]);
            // const paragraph = 'The quick brown fox jumps over the lazy dog. It barked.';
            const foundIPFSinURI = nftURI.match(/ipfs:\/\/(\w+)/);
            if (foundIPFSinURI[1] != ''){
                nftURI = 'https://ipfs.io/ipfs/' + foundIPFSinURI[1];
            }

            let nftJSON = await fetchJSON(nftURI);
            const foundIPFSinJSONImage = nftJSON.image.match(/ipfs:\/\/(\w+)/);
            if (foundIPFSinJSONImage[1] != ''){
                nftJSON.image = 'https://ipfs.io/ipfs/' + foundIPFSinJSONImage[1];
            }

            document.getElementById('div-frens-kept').innerHTML +=
                `<span class="nftdisplay">[${ownedIndex}] Token ID: ${arrayTokenId[i]}<span class="imgbox"><a href="tokens.html?t=${arrayTokenId[i]}"><img class="assets" src="${nftJSON.image}"></a></span></span>`;
            
        }
    }

    document.getElementById('div-keeper-info').innerHTML = `<h3>frens kept by ${ethers.utils.getAddress(keeperAddress.toString())}...&nbsp;&nbsp; ${ownedIndex} in total</h3>`;


}


async function fetchJSON(api_uri) {
	let response = await fetch(api_uri);
	
	if (!response.ok) {
	    throw new Error(`HTTP error! status: ${response.status}`);
	}
	
	let myJSON = await response.json();
	
	return await myJSON;
}
