
async function showLatestFrens() {

    // const provider = ethers.getDefaultProvider(4);
    const provider = new ethers.providers.JsonRpcProvider('https://rinkeby.infura.io/v3/2c1d58028d4343dbb2680897c28b8bc2');

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

    // these are our latest frens

    // const dots = '...';
    // document.getElementById('div-latest-status').innerHTML = '';

    let previousTokenURI = '';
    let n_dots = 0;
    for (let i = events.length-1; i >= 0; i--) {
        // n_dots = (n_dots + 1) % 4;
        // const statusText = 'Loading' + dots.substring(0, n_dots);
        // document.getElementById('div-latest-status').innerHTML = statusText;

        const newItemId = events[i].args[0];
        let tokenURI = events[i].args[1].trim();
        const createdBy = events[i].args[2];
        

        if (tokenURI !== previousTokenURI) {
            previousTokenURI = tokenURI;

            const foundIPFSinURI = tokenURI.match(/ipfs:\/\/(\w+)/);
            if (foundIPFSinURI[1] != ''){
                tokenURI = ipfsGateway + foundIPFSinURI[1];
            }

            let nftJSON = await fetchJSON(tokenURI);


            const foundIPFSinJSONImage = nftJSON.image.match(/ipfs:\/\/(\w+)/);
            if (foundIPFSinJSONImage[1] != ''){
                nftJSON.image = ipfsGateway + foundIPFSinJSONImage[1];
            }


            const createdByShort = createdBy.substring(0, 6) + '...' + createdBy.substring(createdBy.length - 4);

            document.getElementById('div-latest-frens').innerHTML +=
                `
                <div class="nft-item">
                    <img class="nft-image" src="${nftJSON.image}">
                    <div class="nft-token-info">
                        fren #${newItemId}&nbsp;&nbsp;made by&nbsp;&nbsp;<a class="creator" href="creators.html?a=${createdBy}">${createdByShort}</a>
                    </div>
                    <div class="nft-token-info">
                        "${nftJSON.name}"
                    </div>
                    <div class="nft-token-info" style="white-space: pre">${nftJSON.description}</div>
                </div>
                `;

        }
    }

    document.getElementById('div-latest-status').innerHTML = '...these are our latest frens';

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
