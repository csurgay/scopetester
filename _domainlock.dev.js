/* Domain lock (DEV build only - do NOT publish). Also allows localhost for local testing. */
(function(){
    var h=location.hostname;
    if (h!=="csurgay.com" && h!=="www.csurgay.com" && h!=="localhost" && h!=="127.0.0.1") {
        location.replace("https://csurgay.com/syggen");
    }
})();
