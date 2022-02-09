
async function showLatestFrens() {

    const provider = ethers.getDefaultProvider(4);

    const blockNum = await provider.getBlockNumber();   
    // const queryPeriodHour = document.getElementById('query-period-hours').value;
    const queryPeriodHour = 24;
    const queryPeriodBlock = queryPeriodHour * 60 * 60 / 5;
    const fromBlock = blockNum - queryPeriodBlock;
    const toBlock = blockNum;

    const nftContractAddress = '0x69F511EAca22eD5c5f48ba3d5D3D0442340948c9'; // v2.2
    const nftContract = new ethers.Contract(nftContractAddress, frensAbi, provider);

    const eventFilter = nftContract.filters.tokenCreated();
    const events = await nftContract.queryFilter(eventFilter, fromBlock, toBlock);
    // console.log(events);

    let previousTokenURI = '';
    for (let i = events.length-1; i >= 0; i--) {
        const newItemId = events[i].args[0];
        let tokenURI = events[i].args[1].trim();
        const createdBy = events[i].args[2];
        
        // console.log((i+1) + ": " + tokenURI);
        // console.log(previousTokenURI);

        if (tokenURI !== previousTokenURI) {
            previousTokenURI = tokenURI;

            const foundIPFSinURI = tokenURI.match(/ipfs:\/\/(\w+)/);
            if (foundIPFSinURI[1] != ''){
                tokenURI = 'https://ipfs.io/ipfs/' + foundIPFSinURI[1];
            }

            let nftJSON = await fetchJSON(tokenURI);


            const foundIPFSinJSONImage = nftJSON.image.match(/ipfs:\/\/(\w+)/);
            if (foundIPFSinJSONImage[1] != ''){
                nftJSON.image = 'https://ipfs.io/ipfs/' + foundIPFSinJSONImage[1];
            }

            // console.log(nftJSON.image);

            const createdByShort = createdBy.substring(0, 6) + '...' + createdBy.substring(createdBy.length - 4);

            document.getElementById('div-latest-frens').innerHTML +=
                `
                <div class="nft-item">
                    <img class="nft-image" src="${nftJSON.image}">
                    <div class="nft-token-info">
                        fren # ${newItemId}&nbsp;&nbsp;made by&nbsp;&nbsp;${createdByShort}
                    </div>
                    <div class="nft-token-info">
                        ${nftJSON.name}
                    </div>
                    <div class="nft-token-info">
                        ${nftJSON.description}
                    </div>
                </div>
                `;

        }
    }

    // let listContent = '';

}

showLatestFrens();



async function fetchJSON(api_uri) {
	let response = await fetch(api_uri);
	
	if (!response.ok) {
	    throw new Error(`HTTP error! status: ${response.status}`);
	}
	
	let myJSON = await response.json();
	
	return await myJSON;
}
