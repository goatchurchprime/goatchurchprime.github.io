
function decodeHash() 
{
    var hashdict = {};
    var pairs = (window.location.hash[0] === '#' ? window.location.hash.substr(1) : window.location.hash).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        hashdict[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return hashdict;
}
