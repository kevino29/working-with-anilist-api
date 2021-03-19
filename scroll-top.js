window.addEventListener('load', function() {
    const OFFSET = 200;
    let scrollTopBtn = document.querySelector('#scrollTopBtn');

    window.onscroll = function() {
        if (document.body.scrollTop > OFFSET || 
            document.documentElement.scrollTop > OFFSET)
            scrollTopBtn.style.display = 'block';
        else
            scrollTopBtn.style.display = 'none';
    }
    
    scrollTopBtn.addEventListener('click', function() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    })
});