var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);

    if('tag' in urlParams) {
      $('#archive li').removeClass('hidden');
      $('#archive li:not(.tag-' + urlParams['tag'] + ')').addClass('hidden');
    }
})();

$(document).ready(function() {
  $('picture').picture();

  /*$(window).scroll(function() {
    var scrolltop = $(window).scrollTop();
    var windowheight = $(window).height();

    var distanceTop = (windowheight-90) - (scrolltop+50);
    var distanceBottom = scrolltop - windowheight;
    var opacity = 1;

    var distance = 100;
    if(distanceTop < distance && distanceTop > 0) {
      opacity = distanceTop/distance;
    } else if(distanceBottom < distance && distanceBottom > 0) {
      opacity = distanceBottom/distance;
    } else if(distanceBottom < 0 && distanceTop < 0) {
      opacity = 0;
    }
    opacity = opacity * 0.9;

    if(distanceTop > 0) {
      header.css('background-color', 'rgba(255, 255, 255, ' + opacity + ')');
    } else {
      header.css('background-color', 'transparent');
    }

    var readmore = $('#scrolldown');
    var readmoreOpacity = 0;
    if(scrolltop >= 0 && scrolltop < distance) {
      readmoreOpacity = 1 - (scrolltop/distance);
    }
    console.log(readmoreOpacity);
    readmore.css('opacity', readmoreOpacity);
  });*/
});
