(function($) {
  $.fn.snow = function(options) {
      var documentHeight = $(document).height(),
          documentWidth = $(document).width(),
          defaults = {
              minSize: 10,
              maxSize: 50,
              target:"body",
              newOn: 300,
              html:'&#10052',
              direction:"top",
              flakeColor: "#FFFFFF",
              leftMove:200
          },
          options = $.extend({}, defaults, options),
    $flake = $('<div id="flake" />').css({
              'position': 'absolute',
              top: '-50px'
          }).html(options.html);
      var interval = setInterval(function() {
          var startPositionLeft = Math.random() * documentWidth - 100,
              startOpacity = 1 + Math.random(),
              sizeFlake = options.minSize + Math.random() * options.maxSize,
              endPositionTop = documentHeight - 40,
              endPositionLeft = startPositionLeft - 100 + Math.random() * options.leftMove,
              durationFall = documentHeight * 10 + Math.random() * 5000,
              rotate = Math.random() * 360;
          $flake.clone().appendTo(options.target).css({
              left: startPositionLeft - (options.leftMove==200?0:options.leftMove*2 ),
              opacity: startOpacity,
              'font-size': sizeFlake,
              color: options.flakeColor
          }).animate({
              top: endPositionTop,
              left: endPositionLeft,
              transform: 'rotate('+rotate+'deg)',
              opacity: 0.2
          }, durationFall, 'linear', function() {
              $(this).remove()
          });
      }, options.newOn);
      $(window).resize(function (){
        documentHeight = $(document).height()
        documentWidth = $(document).width()
      });
    return interval;
  };

  $.fn.raining = function(options) {
      var documentHeight = $(document).height(),
          documentWidth = $(document).width(),
          defaults = {
              minSize: 20,
              maxSize: 30,
              target:"body",
              newOn: 200,
              flakeColor: "#FFFFFF",
              html:'|'
          },
          options = $.extend({}, defaults, options),
    $flake = $('<div id="flake" />').css({
              'position': 'absolute',
              'top': '-50px'
          }).html(options.html);
      var interval = setInterval(function() {
          var startPositionLeft = Math.random() * documentWidth - 100,
              startOpacity = 1 + Math.random(),
              sizeFlake = options.minSize + Math.random() * options.maxSize,
              endPositionTop = documentHeight - 40,
              durationFall = (documentHeight) / 2;// 떨어지는 속도
          $flake.clone().appendTo(options.target).css({
              left: startPositionLeft,
              opacity: startOpacity,
              'font-size': sizeFlake,
              color: options.flakeColor
          }).animate({
              top: endPositionTop,
              opacity: 0.2
          }, durationFall, 'linear', function() {
              $(this).remove()
          });
      }, options.newOn);
      $(window).resize(function (){
        documentHeight = $(document).height()
        documentWidth = $(document).width()
      });
    return interval;
  };
  $.fn.bottomup = function(options) {
      var documentHeight = $(document).height(),
          documentWidth = $(document).width(),
          defaults = {
              minSize: 10,
              maxSize: 50,
              target:"body",
              newOn: 300,
              html:'&#10052',
              direction:"top",
              flakeColor: "#FFFFFF",
              leftMove:200
          },
          options = $.extend({}, defaults, options),
    $flake = $('<div id="flake" />').css({
              'position': 'absolute',
              bottom: '-50px'
          }).html(options.html);
      var interval = setInterval(function() {
          var startPositionLeft = Math.random() * documentWidth - 100,
              startOpacity = 1 + Math.random(),
              sizeFlake = options.minSize + Math.random() * options.maxSize,
              endPositionTop = documentHeight - 40,
              endPositionLeft = startPositionLeft - 100 + Math.random() * options.leftMove,
              durationFall = documentHeight * 10 + Math.random() * 5000,
              rotate = Math.random() * 360;
          $flake.clone().appendTo(options.target).css({
              left: startPositionLeft - (options.leftMove==200?0:options.leftMove),
              opacity: startOpacity,
              'font-size': sizeFlake,
              color: options.flakeColor
          }).animate({
              bottom: endPositionTop,
              left: endPositionLeft,
              transform: 'rotate('+rotate+'deg)',
              opacity: 0.2
          }, durationFall, 'linear', function() {
              $(this).remove()
          });
      }, options.newOn);
      $(window).resize(function (){
        documentHeight = $(document).height()
        documentWidth = $(document).width()
      });
    return interval;
  };
})(jQuery);
