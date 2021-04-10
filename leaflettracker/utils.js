
function decodeQuery() 
{
    var hashdict = {};
    var pairs = (window.location.search[0] === '?' ? window.location.search.substr(1) : window.location.search).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        hashdict[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return hashdict;
}
