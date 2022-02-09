// smartify-wallet.js
// onConnect();

function showInput(inputId, element){
    document.getElementById(inputId).style.display = element.value == '0x0' ? 'block' : 'none';
}


let isRunning = false;

async function showNFTs() {

    if (isRunning == false) {
        isRunning = true;

        await connectWallet();
        await switchNetwork();
        // console.log(connected0xAccount);

        const provider = new ethers.providers.Web3Provider(window.ethereum);


        let nftContractAddress = document.getElementById('nft-contract-address').value;

        if (nftContractAddress === 'none-selected'){
            document.getElementById('collection-and-owner').innerHTML = '<h3>Please specify a collection.</h3>';
            isRunning = false;
            return 0;
        }
        else if (nftContractAddress === '0x0'){
            nftContractAddress = document.getElementById('custom-nft-contract-address').value;
        }
        console.log(`log: contract address set to ${nftContractAddress}`);

        const nftContract = new ethers.Contract(nftContractAddress, ERC721Abi, provider);

        const nameOfNft = await nftContract.name();

        // connected0xAccount = '';
        const eventFilterReceived = nftContract.filters.Transfer(null, connected0xAccount, null);
        const eventsReceived = await nftContract.queryFilter(eventFilterReceived);
        // console.log(eventsReceived);

        const eventFilterSent = nftContract.filters.Transfer(connected0xAccount, null, null);
        const eventsSent = await nftContract.queryFilter(eventFilterSent);
        // console.log(eventsSent);

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

        document.getElementById('collection-and-owner').innerHTML = `<h3>${nameOfNft} owned by ${connected0xAccount}... </h3>`;

        document.getElementById('list-of-nfts').innerHTML = '';
        for (let i = 0; i < arrayTokenId.length; i++) {
            if (ownedCandidates[String(arrayTokenId[i])]["owned"] === true) {

                ownedIndex++;
                let nftURI = await nftContract.tokenURI(arrayTokenId[i]);
                // const paragraph = 'The quick brown fox jumps over the lazy dog. It barked.';
                const foundIPFSinURI = nftURI.match(/ipfs:\/\/(\w+)/);
                if (foundIPFSinURI[1] != ''){
                    nftURI = 'https://ipfs.io/ipfs/' + foundIPFSinURI[1];
                }
                // console.log("ipfs: " + found[1]);

                // console.log(nftURI);
                let nftJSON = await fetchJSON(nftURI);
                // console.log(nftJSON);
                // console.log(nftJSON.name);
                // console.log(nftJSON.attributes[0]);
                // console.log(nftJSON.attributes[0]["value"]);
                const foundIPFSinJSONImage = nftJSON.image.match(/ipfs:\/\/(\w+)/);
                if (foundIPFSinJSONImage[1] != ''){
                    nftJSON.image = 'https://ipfs.io/ipfs/' + foundIPFSinJSONImage[1];
                }

                document.getElementById('list-of-nfts').innerHTML +=
                    `<span class="nftdisplay">[${ownedIndex}] Token ID: ${arrayTokenId[i]}<span class="imgbox"><a href="tokens.html?t=${arrayTokenId[i]}"><img class="assets" src="${nftJSON.image}"></a></span> <a href="transfer.html?nft_contract_address=${nftContractAddress}&token_id=${arrayTokenId[i]}" title="Transfer"><img src="transfer-icon-neg.png"></a></span>`;
                
            }
        }

        document.getElementById('collection-and-owner').innerHTML = `<h3>${nameOfNft} owned by ${ethers.utils.getAddress(connected0xAccount.toString())}...&nbsp;&nbsp; ${ownedIndex} in total</h3>`;
        isRunning = false;
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
