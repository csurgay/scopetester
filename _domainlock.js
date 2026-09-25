/* Domain lock (PRODUCTION): runs only on csurgay.com. Any other host - including a copy
   served from someone else's localhost or opened from a file - redirects to the original. */
(function(){
    var h=location.hostname;
    if (h!=="csurgay.com" && h!=="www.csurgay.com") {
        location.replace("https://csurgay.com/syggen");
    }
})();
