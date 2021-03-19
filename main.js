window.addEventListener('load', function() {
    let searchQuery = document.querySelector('#searchBox');
    let resultList = document.querySelector('#results');
    
    document.querySelector('#searchButton').addEventListener('click', function() {
        if (searchQuery.value === null || 
            searchQuery.value === undefined || 
            searchQuery.value.length === 0)
            return;

        // Here we define our query as a multi-line string
        // Storing it in a separate .graphql/.gql file is also possible
        var query = `
            # Define which variables will be used in the query
            query ($search: String) {
                # Insert our variables into the query arguments (type: ANIME is hard-coded in the query)
                Media (type: ANIME, search: $search) {
                    id
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
        `;
        
        // Define our query variables and values that will be used in the query request
        var variables = {
            search: searchQuery.value
        };

        getApiJSON(query, variables);
    });

    async function getApiJSON(query, variables) {
        // Define the config we'll need for our Api request
        var url = 'https://graphql.anilist.co',
            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables
                })
            };

        // Make the HTTP Api request
        await fetch(url, options).then(handleResponse)
            .then(handleData)
            .catch(handleError);

        function handleResponse(response) {
            return response.json().then(function (json) {
                return response.ok ? json : Promise.reject(json);
            });
        }
    
        function handleData(data) {
            console.log(data)
            let newCol = document.createElement('div');

            let newCard = document.createElement('div');
            newCard.classList.add('card', 'zoom', 'shadow-lg');

            let newCardBody = document.createElement('div');
            newCardBody.classList.add('card-body');

            let newLink = document.createElement('a');
            newLink.classList.add('stretched-link');

            if (data.data.Media.title.english !== null)
                newLink.innerText = data.data.Media.title.english;
            else
                newLink.innerText = data.data.Media.title.romaji;
            newLink.target = '_blank';
            newLink.href = data.data.Media.siteUrl;

            let newImage = document.createElement('img');
            newImage.classList.add('card-img-top');
            newImage.src = data.data.Media.coverImage.large;
            newImage.alt = data.data.Media.title.romaji;
            
            newCardBody.appendChild(newLink);

            newCard.appendChild(newImage);
            newCard.appendChild(newCardBody);

            newCol.appendChild(newCard);

            resultList.appendChild(newCol);
        }
    
        function handleError(error) {
            // alert('Error, check console');
            console.error(error);
        }
    }
});