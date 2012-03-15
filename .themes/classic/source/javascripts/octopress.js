function bindKeyboardShortcuts() {
  var SELECTED_ARTICLE_CLASS = 'keyboard-active',
      selectedArticle = false,
      articles = jQuery('div.blog-index, div#blog-archives').find('article');

  function scrollTo(article) {
    jQuery('html,body').animate({scrollTop: article.offset().top}, 'slow');
  }

  // A "visual bell" of sorts.
  function blink(article) {
    article.animate({opacity: 0.25}, 'fast', function() {article.animate({opacity: 1.0}, 'fast');});
  }

  function select(article) {
    if (selectedArticle) {
      if (selectedArticle.is(article) || article.length === 0) {
        blink(selectedArticle);
        return;
      }

      selectedArticle.removeClass(SELECTED_ARTICLE_CLASS);
    }

    selectedArticle = article;
    article.addClass(SELECTED_ARTICLE_CLASS);
    scrollTo(article);
  }

  // BINDINGS FOR ALL PAGES

  // Go to the index (use whatever the header links to as the target)
  jQuery(document).bind('keyup', 'i', function() {
    var href = jQuery('header h1 a').first().attr('href');

    if (href) {
      window.location.href = href;
    }
  });

  // Go to the comments (reply) -- should work on an individual post / page, or on the index (if comments are enabled)
  jQuery(document).bind('keyup', 'r', function() {
    if (articles.length === 0) {
      var comments = jQuery('#disqus_thread');
      if (comments) {
        scrollTo(comments);
      }
    } else {
      if (selectedArticle === false) {
        return;
      }

      var href = selectedArticle.find('header p.meta a').first().attr('href');

      if (href) {
        window.location.href = href;
      }
    }
  });

  jQuery(document).bind('keyup', '/', function() {
    jQuery('input.search').focus();
  });

  jQuery(document).bind('keyup', 'shift+/', function() {
    window.alert("Keyboard shortcuts:\n\n" +
                 "j: Next article\n" +
                 "k: Previous article\n" +
                 "^: First article\n" +
                 "$: Last article\n" +
                 "RET: View full article\n" +
                 "r: Comment on article (\"reply\")\n" +
                 "i: Go to the index\n" +
                 "p: Previous page (older articles)\n" +
                 "n: Next page (newer articles)\n" +
                 "l: Scroll to selected article\n" +
                 "/: Search\n" +
                 "?: Help (this page)"
                );
  });

  if (articles.length === 0) {
    return;
  }

  // BINDINGS FOR ARTICLE LISTINGS

  jQuery(document).bind('keyup', 'j', function() {
    if (selectedArticle === false) {
      select(articles.first());
    } else {
      var nextArticle = articles.eq(articles.index(selectedArticle) + 1);
      select(nextArticle);
    }
  });

  jQuery(document).bind('keyup', 'k', function() {
    if (selectedArticle === false) {
      select(articles.last());
    } else {
      var index = articles.index(selectedArticle);
      if (index === 0) {
        select(selectedArticle);
      } else {
        var previousArticle = articles.eq(index - 1);
        select(previousArticle);
      }
    }
  });

  jQuery(document).bind('keyup', 'return', function() {
    if (selectedArticle === false) {
      return;
    }

    window.location.href = selectedArticle.find('h1 a').first().attr('href');
  });

  jQuery(document).bind('keyup', 'l', function() {
    if (selectedArticle === false) {
      return;
    }

    scrollTo(selectedArticle);
  });

  jQuery(document).bind('keyup', '^', function() {
    select(articles.first());
  });

  jQuery(document).bind('keyup', '$', function() {
    select(articles.last());
  });

  jQuery(document).bind('keyup', 'p', function() {
    var href = jQuery('a.prev').attr('href');

    if (href) {
      window.location.href = href;
    }
  });

  jQuery(document).bind('keyup', 'n', function() {
    var href = jQuery('a.next').attr('href');

    if (href) {
      window.location.href = href;
    }
  });
}

function getNav() {
  var mobileNav = $('nav[role=navigation] fieldset[role=search]').after('<fieldset class="mobile-nav"></fieldset>').next().append('<select></select>');
  mobileNav.children('select').append('<option value="">Navigate&hellip;</option>');
  $('ul[role=main-navigation]').addClass('main-navigation');
  $('ul.main-navigation a').each(function(link) {
    mobileNav.children('select').append('<option value="'+link.href+'">&raquo; '+link.text+'</option>');
  });
  $('ul.subscription a').each(function(link) {
    mobileNav.children('select').append('<option value="'+link.href+'">&raquo; '+link.text+'</option>');
  });
  mobileNav.children('select').bind('change', function(event) {
    if (event.target.value) { window.location.href = event.target.value; }
  });
}

function addSidebarToggler() {
  if(!$('body').hasClass('sidebar-footer')) {
    $('#content').append('<span class="toggle-sidebar"></span>');
    $('.toggle-sidebar').bind('click', function(e) {
      e.preventDefault();
      if ($('body').hasClass('collapse-sidebar')) {
        $('body').removeClass('collapse-sidebar');
      } else {
        $('body').addClass('collapse-sidebar');
      }
    });
  }
  var sections = $('aside.sidebar > section');
  if (sections.length > 1) {
    sections.each(function(section, index){
      if ((sections.length >= 3) && index % 3 === 0) {
        $(section).addClass("first");
      }
      var count = ((index +1) % 2) ? "odd" : "even";
      $(section).addClass(count);
    });
  }
  if (sections.length >= 3){ $('aside.sidebar').addClass('thirds'); }
}

function testFeatures() {
  var features = ['maskImage'];
  $(features).map(function(feature) {
    if (Modernizr.testAllProps(feature)) {
      $('html').addClass(feature);
    } else {
      $('html').addClass('no-'+feature);
    }
  });
  if ("placeholder" in document.createElement("input")) {
    $('html').addClass('placeholder');
  } else {
    $('html').addClass('no-placeholder');
  }
}

function addCodeLineNumbers() {
  if (navigator.appName === 'Microsoft Internet Explorer') { return; }
  $('div.gist-highlight').each(function(code) {
    var tableStart = '<table><tbody><tr><td class="gutter">',
        lineNumbers = '<pre class="line-numbers">',
        tableMiddle = '</pre></td><td class="code">',
        tableEnd = '</td></tr></tbody></table>',
        count = $('.line', code).length;
    for (var i=1;i<=count; i++) {
      lineNumbers += '<span class="line-number">'+i+'</span>\n';
    }
    var table = tableStart + lineNumbers + tableMiddle + '<pre>'+$('pre', code).html()+'</pre>' + tableEnd;
    $(code).html(table);
  });
}

function flashVideoFallback(){
  var flashplayerlocation = "/assets/jwplayer/player.swf",
      flashplayerskin = "/assets/jwplayer/glow/glow.xml";
  $('video').each(function(video){
    video = $(video);
    if (!Modernizr.video.h264 && swfobject.getFlashPlayerVersion() || window.location.hash.indexOf("flash-test") !== -1){
      video.children('source[src$=mp4]').first().map(function(source){
        var src = $(source).attr('src'),
            id = 'video_'+Math.round(1 + Math.random()*(100000)),
            width = video.attr('width'),
            height = parseInt(video.attr('height'), 10) + 30;
            video.after('<div class="flash-video"><div><div id='+id+'>');
        swfobject.embedSWF(flashplayerlocation, id, width, height + 30, "9.0.0",
          { file : src, image : video.attr('poster'), skin : flashplayerskin } ,
          { movie : src, wmode : "opaque", allowfullscreen : "true" }
        );
      });
      video.remove();
    }
  });
}

function wrapFlashVideos() {
  $('object').each(function(object) {
    object = $(object);
    if ( $('param[name=movie]', object).length ) {
      var wrapper = object.before('<div class="flash-video"><div>').previous();
      $(wrapper).children().append(object);
    }
  });
  $('iframe[src*=vimeo],iframe[src*=youtube]').each(function(iframe) {
    iframe = $(iframe);
    var wrapper = iframe.before('<div class="flash-video"><div>').previous();
    $(wrapper).children().append(iframe);
  });
}

function renderDeliciousLinks(items) {
  var output = "<ul>";
  for (var i=0,l=items.length; i<l; i++) {
    output += '<li><a href="' + items[i].u + '" title="Tags: ' + (items[i].t == "" ? "" : items[i].t.join(', ')) + '">' + items[i].d + '</a></li>';
  }
  output += "</ul>";
  $('#delicious').html(output);
}

$.domReady(function() {
  testFeatures();
  wrapFlashVideos();
  flashVideoFallback();
  addCodeLineNumbers();
  getNav();
  addSidebarToggler();
  bindKeyboardShortcuts();
});

// iOS scaling bug fix
// Rewritten version
// By @mathias, @cheeaun and @jdalton
// Source url: https://gist.github.com/901295
(function(doc) {
  var addEvent = 'addEventListener',
      type = 'gesturestart',
      qsa = 'querySelectorAll',
      scales = [1, 1],
      meta = qsa in doc ? doc[qsa]('meta[name=viewport]') : [];
  function fix() {
    meta.content = 'width=device-width,minimum-scale=' + scales[0] + ',maximum-scale=' + scales[1];
    doc.removeEventListener(type, fix, true);
  }
  if ((meta = meta[meta.length - 1]) && addEvent in doc) {
    fix();
    scales = [0.25, 1.6];
    doc[addEvent](type, fix, true);
  }
}(document));

/*!	SWFObject v2.2 modified by Brandon Mathis to contain only what is necessary to dynamically embed flash objects
  * Uncompressed source in javascripts/libs/swfobject-dynamic.js
  * <http://code.google.com/p/swfobject/>
	released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*/
var swfobject=function(){function s(a,b,d){var q,k=n(d);if(g.wk&&g.wk<312)return q;if(k){if(typeof a.id==l)a.id=d;if(g.ie&&g.win){var e="",c;for(c in a)if(a[c]!=Object.prototype[c])c.toLowerCase()=="data"?b.movie=a[c]:c.toLowerCase()=="styleclass"?e+=' class="'+a[c]+'"':c.toLowerCase()!="classid"&&(e+=" "+c+'="'+a[c]+'"');c="";for(var f in b)b[f]!=Object.prototype[f]&&(c+='<param name="'+f+'" value="'+b[f]+'" />');k.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+e+">"+c+
"</object>";q=n(a.id)}else{f=i.createElement(o);f.setAttribute("type",m);for(var h in a)a[h]!=Object.prototype[h]&&(h.toLowerCase()=="styleclass"?f.setAttribute("class",a[h]):h.toLowerCase()!="classid"&&f.setAttribute(h,a[h]));for(e in b)b[e]!=Object.prototype[e]&&e.toLowerCase()!="movie"&&(a=f,c=e,h=b[e],d=i.createElement("param"),d.setAttribute("name",c),d.setAttribute("value",h),a.appendChild(d));k.parentNode.replaceChild(f,k);q=f}}return q}function n(a){var b=null;try{b=i.getElementById(a)}catch(d){}return b}
function t(a){var b=g.pv,a=a.split(".");a[0]=parseInt(a[0],10);a[1]=parseInt(a[1],10)||0;a[2]=parseInt(a[2],10)||0;return b[0]>a[0]||b[0]==a[0]&&b[1]>a[1]||b[0]==a[0]&&b[1]==a[1]&&b[2]>=a[2]?!0:!1}function u(a){return/[\\\"<>\.;]/.exec(a)!=null&&typeof encodeURIComponent!=l?encodeURIComponent(a):a}var l="undefined",o="object",m="application/x-shockwave-flash",v=window,i=document,j=navigator,g=function(){var a=typeof i.getElementById!=l&&typeof i.getElementsByTagName!=l&&typeof i.createElement!=l,
b=j.userAgent.toLowerCase(),d=j.platform.toLowerCase(),g=d?/win/.test(d):/win/.test(b),d=d?/mac/.test(d):/mac/.test(b),b=/webkit/.test(b)?parseFloat(b.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):!1,k=!+"\u000b1",e=[0,0,0],c=null;if(typeof j.plugins!=l&&typeof j.plugins["Shockwave Flash"]==o){if((c=j.plugins["Shockwave Flash"].description)&&!(typeof j.mimeTypes!=l&&j.mimeTypes[m]&&!j.mimeTypes[m].enabledPlugin))k=!1,c=c.replace(/^.*\s+(\S+\s+\S+$)/,"$1"),e[0]=parseInt(c.replace(/^(.*)\..*$/,"$1"),
10),e[1]=parseInt(c.replace(/^.*\.(.*)\s.*$/,"$1"),10),e[2]=/[a-zA-Z]/.test(c)?parseInt(c.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}else if(typeof v.ActiveXObject!=l)try{var f=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");if(f&&(c=f.GetVariable("$version")))k=!0,c=c.split(" ")[1].split(","),e=[parseInt(c[0],10),parseInt(c[1],10),parseInt(c[2],10)]}catch(h){}return{w3:a,pv:e,wk:b,ie:k,win:g,mac:d}}();return{embedSWF:function(a,b,d,i,k,e,c,f,h){var j={success:!1,id:b};if(g.w3&&!(g.wk&&g.wk<312)&&
a&&b&&d&&i&&k){d+="";i+="";var p={};if(f&&typeof f===o)for(var m in f)p[m]=f[m];p.data=a;p.width=d;p.height=i;a={};if(c&&typeof c===o)for(var n in c)a[n]=c[n];if(e&&typeof e===o)for(var r in e)typeof a.flashvars!=l?a.flashvars+="&"+r+"="+e[r]:a.flashvars=r+"="+e[r];if(t(k))b=s(p,a,b),j.success=!0,j.ref=b}h&&h(j)},ua:g,getFlashPlayerVersion:function(){return{major:g.pv[0],minor:g.pv[1],release:g.pv[2]}},hasFlashPlayerVersion:t,createSWF:function(a,b,d){if(g.w3)return s(a,b,d)},getQueryParamValue:function(a){var b=
i.location.search||i.location.hash;if(b){/\?/.test(b)&&(b=b.split("?")[1]);if(a==null)return u(b);for(var b=b.split("&"),d=0;d<b.length;d++)if(b[d].substring(0,b[d].indexOf("="))==a)return u(b[d].substring(b[d].indexOf("=")+1))}return""}}}();

