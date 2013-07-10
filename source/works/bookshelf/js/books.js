(function() {
  var pad, proto, ratio;

  ratio = 2;

  pad = 20;

  proto = {
    imageWidth: function() {
      return this.size.width / ratio;
    },
    imageHeight: function() {
      return this.size.length / ratio;
    },
    shadow: function() {
      var blur, offset;
      blur = this.size.height / ratio;
      offset = blur * 0.3;
      return "" + offset + "px " + offset + "px " + blur + "px";
    }
  };

  $(function() {
    return $.getJSON('data/books.json', function(books) {
      var $box, $container, $img, book, _i, _len;
      $('h1').text("" + books.length + " " + ($('h1').text()));
      books.sort(function(a, b) {
        return a.size.length - b.size.length;
      });
      $container = $('#container');
      for (_i = 0, _len = books.length; _i < _len; _i++) {
        book = books[_i];
        if (!(book.image.url && book.size.width)) continue;
        book.date = Date.parse(book.pub_date);
        $.extend(book, proto);
        $box = $('<div />').addClass('book').appendTo($container).css({
          float: 'left',
          textAlign: 'center',
          padding: "" + pad + "px",
          width: book.imageWidth(),
          height: book.imageHeight()
        }).data({
          book: book
        });
        $img = $('<img />').attr({
          src: book.image.url,
          width: book.imageWidth(),
          height: book.imageHeight(),
          alt: book.title
        }).appendTo($box).css({
          boxShadow: "" + (book.shadow()) + " #333"
        });
      }
      $('#date').click(function() {
        var currentWidth;
        console.log('Sorting with date');
        currentWidth = 0;
        return $('.book').sortElements(function(a, b) {
          var ba, bb;
          ba = $(a).data('book');
          bb = $(b).data('book');
          return ba.date - bb.date;
        }).each(function() {
          var $this;
          $this = $(this);
          currentWidth += $this.width() + pad * 2;
          if (currentWidth > 4500) {
            $this.css({
              clear: 'both'
            });
            return currentWidth = 0;
          } else {
            return $this.css({
              clear: 'none'
            });
          }
        });
      });
      return $('#size').click(function() {
        console.log('Sorting with size');
        return $('.book').sortElements(function(a, b) {
          var ba, bb;
          ba = $(a).data('book');
          bb = $(b).data('book');
          return ba.size.length - bb.size.length;
        }).css({
          clear: 'none'
        });
      });
    });
  });

}).call(this);
