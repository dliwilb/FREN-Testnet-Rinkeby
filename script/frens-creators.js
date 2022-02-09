
function onShowCreated() {
    const creatorAddress = document.getElementById('creator-address').value;
    if ( ethers.utils.isAddress(creatorAddress) ){
        document.getElementById('div-frens-created').innerHTML = 'Loading...';
        showCreated(creatorAddress);
    } else {
        document.getElementById('div-frens-created').innerHTML = 'Please enter a valid creator address.';
        return 0;
    }
}

async function showCreated(createdBy) {
    const provider = ethers.getDefaultProvider(4);

    const blockNum = await provider.getBlockNumber();   
    // const queryPeriodHour = document.getElementById('query-period-hours').value;
    const queryPeriodHour = 24;
    const queryPeriodBlock = queryPeriodHour * 60 * 60 / 5;
    const fromBlock = blockNum - queryPeriodBlock;
    const toBlock = blockNum;

    const nftContractAddress = '0x69F511EAca22eD5c5f48ba3d5D3D0442340948c9'; // v2.2
    const nftContract = new ethers.Contract(nftContractAddress, frensAbi, provider);

    // const creatorAddress = '0x813AD48aa283FA788711423422d92CA433A33FE9';

    const eventFilter = nftContract.filters.tokenCreated(null, null, createdBy);
    const events = await nftContract.queryFilter(eventFilter, fromBlock, toBlock);
    // console.log(events);

    const createdByShort = createdBy.substring(0, 6) + '...' + createdBy.substring(createdBy.length - 4);

    document.getElementById('div-frens-created').innerHTML = 'frens&nbsp;&nbsp;made by&nbsp;&nbsp;' + createdByShort;

    let previousTokenURI = '';
    let isRepeating = false;

    let htmlToAdd = '';
    for (let i = events.length-1; i >= 0; i--) {
        const newItemId = events[i].args[0];
        let tokenURI = events[i].args[1].trim();

        if (tokenURI !== previousTokenURI) {
            isRepeating = false;

            if (i < events.length-1){
                // document.getElementById('div-frens-created').innerHTML += '</div><!-- loc#1 -->';
                htmlToAdd += '</div><!-- loc#1 -->';
            }

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

            // document.getElementById('div-frens-created').innerHTML +=
            htmlToAdd += 
                `
                <div class="nft-item">
                    <img class="nft-image" src="${nftJSON.image}">
                    <div class="nft-token-info">
                        # ${newItemId} : "${nftJSON.name}"
                    </div><!-- loc#a -->
                    <div class="nft-token-info">
                        ${nftJSON.description}
                    </div><!-- loc#b -->
                `;
            

        } else {
            // console.log('trued');
            if (isRepeating == true){
                htmlToAdd += 
                `
                <span class="nft-token-info"># ${newItemId} </span>&nbsp;<!-- loc#2 -->
                `;
            } else {
                htmlToAdd += 
                `
                <span class="nft-token-info">Multiple Editions...&nbsp;&nbsp;# ${newItemId} </span>&nbsp;<!-- loc#2 -->
                `;
                isRepeating = true;
            }


            // document.getElementById('div-frens-created').innerHTML +=

        }

    }

    htmlToAdd += '</div><!-- loc#3 -->';
    isRepeating = false;
    

    console.log(htmlToAdd);
    document.getElementById('div-frens-created').innerHTML += htmlToAdd;


}


async function fetchJSON(api_uri) {
	let response = await fetch(api_uri);
	
	if (!response.ok) {
	    throw new Error(`HTTP error! status: ${response.status}`);
	}
	
	let myJSON = await response.json();
	
	return await myJSON;
}
