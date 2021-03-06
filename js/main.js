window.addEventListener('load', function () {
    let title = document.querySelector('#title');
    let lists = document.querySelector('#list');
    let searchElement = document.querySelector('#searchBox');
    let resultList = document.querySelector('#results');

    // Create the API Endpoint URL
    let url = 'https://graphql.anilist.co';

    // Here we define our query as a multi-line string
    // Storing it in a separate .graphql/.gql file is also possible
    let query = `
        query ($search: String, $type: MediaType) {
            MediaListCollection (userName: $search, type: $type) {
                user {
                    name
                }
                lists {
                    name
                    entries {
                        media {
                            id
                            type
                            siteUrl
                            title {
                                romaji
                                english
                                native
                            }
                            coverImage {
                                extraLarge
                                large
                                medium
                            }
                        }
                    }
                }
            }
        }
    `;

    // Global var object
    let variables = {};

    // Global search query string
    let searchQuery;
    
    document.querySelector('#searchButton').addEventListener('click', () => {
        if (searchElement.value === null || searchElement.value === undefined)
            return;
        else
            searchQuery = searchElement.value;

        // Define our query variables and values that will be used in the query request
        variables = {
            search: searchElement.value,
            type: 'ANIME',
        };

        requestAPI(variables);
    });

    async function requestAPI(vars) {
        // Clear the content of the page first
        clearContent();

        // Show a loading screen
        showLoader();

        // Define the config we'll need for our Api request
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: vars
            })
        };

        // Make the HTTP Api request
        await fetch(url, options)
            .then(handleResponse)
            .then(handleData)
            .catch(handleError);

        // Add the select listeners after the title has been refreshed
        if (!document.querySelector('#animeSelect') || !document.querySelector('#mangaSelect'))
            return;

        // Add a listener when ANIME option is selected
        document.querySelector('#animeSelect').addEventListener('click', () => {
            variables = {
                search: searchQuery,
                type: 'ANIME',
            };
            requestAPI(variables);
        });

        // Add a listener when MANGA option is selected
        document.querySelector('#mangaSelect').addEventListener('click', () => {
            variables = {
                search: searchQuery,
                type: 'MANGA',
            };
            requestAPI(variables);
        });
    }

    function handleResponse(response) {
        return response.json().then(function (json) {
            return response.ok ? json : Promise.reject(json);
        });
    }

    function handleData(data) {
        console.dir(data);
        let newRow;

        clearContent();

        if (data.data.MediaListCollection.lists.length > 0) {
            let mediaType = data.data.MediaListCollection.lists[0].entries[0].media.type;

            // Set the title
            title.innerHTML = data.data.MediaListCollection.user.name + "'s " +
            `
                <div class="dropup" style="display:inline-block;">
                    <button
                        class="btn btn-primary btn-lg dropdown-toggle"
                        type="button"
                        id="dropdownMenuButton"
                        data-mdb-toggle="dropdown"
                        aria-expanded="false">
                        ${mediaType}
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <li><h6 class="dropdown-header">Select a media</h6></li>
                        <li><button id="animeSelect" class="dropdown-item">ANIME</button></li>
                        <li><button id="mangaSelect" class="dropdown-item">MANGA</button></li>
                    </ul>
                </div>
                List
            `;
        }
        else {
            resultList.innerHTML = 
            `
                <div class="h1 text-center">
                    Hmm. It looks like that user has no ${variables.type.toLowerCase()} list.
                </div>
            `;
        }

        data.data.MediaListCollection.lists
            .map((li, i) => {
                newRow = document.createElement('div');
                newRow.classList.add('row', 'justify-content-center', 'pb-5', 'mx-auto');
                newRow.id = 'list-' + i;

                newList = document.createElement('li');
                newList.classList.add('list-group-item', 'border-0')

                let newListLink = document.createElement('a');
                newListLink.innerText = li.name;
                newListLink.href = '#list-' + i;

                newList.appendChild(newListLink);
                lists.appendChild(newList);

                let newRowTitle = document.createElement('div');
                newRowTitle.classList.add('h2', 'w-100', 'text-center', 'py-4');
                newRowTitle.innerText = li.name;

                newRow.appendChild(newRowTitle);

                li.entries
                    .sort(sortMediaByTitle)
                    .map(addNewMedia);
 
                // Add the new result
                resultList.appendChild(newRow);
            });

        function sortMediaByTitle(a, b) {
            let x;
            let y;
    
            // Pick the former media's title that isn't null
            if (a.media.title.english !== null)
                x = a.media.title.english.toLowerCase();
            else if (a.media.title.romaji !== null)
                x = a.media.title.romaji.toLowerCase();
            else 
                x = a.media.title.native;
    
            // Pick the latter media's title that isn't null
            if (b.media.title.english !== null)
                y = b.media.title.english.toLowerCase();
            else if (b.media.title.romaji !== null)
                y = b.media.title.romaji.toLowerCase();
            else
                y = b.media.title.native;
    
            // Compare the former and the latter to sort it
            if (x < y)
                return -1;
            if (x > y)
                return 1;
            return 0;
        }
    
        function addNewMedia(m) {
            let media = m.media;
    
            // Create a new col
            let newCol = document.createElement('div');
            newCol.classList.add('col');
    
            // Create a new card, with a bunch of other styling
            let newCard = document.createElement('div');
            newCard.classList.add('card', 'zoom-sm', 'shadow-lg', 'card-md', 'm-2', 'mx-auto');
    
            // Create a new card body
            let newCardBody = document.createElement('div');
            newCardBody.classList.add('card-body', 'overflow-auto', 'minimize-scrollbar');
    
            // Create a new title for the card
            let newLink = document.createElement('a');
    
            // Pick the title that isn't null, check english first
            if (media.title.english !== null)
                newLink.innerText = media.title.english;
            else if (media.title.romaji !== null)
                newLink.innerText = media.title.romaji;
            else
                newLink.innerText = media.title.native;
    
            newLink.target = '_blank';
            newLink.href = media.siteUrl;
    
            // Create a new image for the card
            let newImage = document.createElement('img');
            newImage.classList.add('card-img-top', 'card-img-md', 'img-fluid');
            newImage.src = media.coverImage.large;
            newImage.alt = media.title.romaji;
    
            // Combine every element
            newCardBody.appendChild(newLink);
            newCard.appendChild(newImage);
            newCard.appendChild(newCardBody);
            newCol.appendChild(newCard);
            newRow.appendChild(newCol);
        }
    }

    function handleError(error) {
        console.error(error);

        resultList.innerHTML = 
        `
            <div class="h1 text-center">
                Oops! That user doesn't exist!<br/> Please try another user.
            </div>
        `;
    }

    function clearContent() {
        // Remove the previous result first, if there was any
        while (resultList.hasChildNodes()) {
            resultList.removeChild(resultList.lastChild);
        }

        // Remove the previous list first, if there was any
        while (lists.hasChildNodes()) {
            lists.removeChild(lists.lastChild);
        }
    }

    function showLoader() {
        let loader = document.createElement('div');
        loader.classList.add('loader');
        resultList.appendChild(loader);
    }

    // function addScrollspy() {
    //     resultList.setAttribute('data-mdb-spy', 'scroll');
    //     resultList.setAttribute('data-mdb-target', '#scrollspy');
    //     resultList.setAttribute('data-mdb-offset', '0');
    //     // data-mdb-spy="scroll" data-mdb-target="#scrollspy" data-mdb-offset="0"
    // }
});