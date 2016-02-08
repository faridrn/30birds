var App = {
    firstInit: false
    , start: function (title) {
        new Data(new HandleLocation(Location.get()).id);
        document.title = (typeof title === "undefined") ? Global.pageTitle : Global.pageTitle + ' - ' + title; // Set title
        if (App.firstInit === false) {
            App.firstInit = true;
            App.addListeners();
        }
    }
    , navigate: function (params) {
        history.pushState(null, params.title, params.href);
        App.start(params.title);
    }
    , addListeners: function () {
        window.onpopstate = history.onpushstate = function (e) {
            if (e.type === 'popstate')
                App.start();
        };

        // Resoinsive Utilities
        responsive_resize();
        $(window).resize(function () { // Change width value on user resize, after DOM
            responsive_resize();
        });
        return null;
    }
};
var Global = {
    pageTitle: '30Birds'
    , getLinkParams: function ($obj) {
        return {
            href: $obj.attr('href')
            , title: $obj.attr('href').split('-')[1].replace('/', '')
        };
    }
};
function HandleLocation(url) {
    "use strict";

    this.url = url;
    this.id;

    this.getId = function (url) {
        var parts = url.split('/');
        var last = parts.pop();
        var part = (last !== "") ? last : parts.pop();
        var id = part.split('-')[0];
        return id;
    };

    var __construct = function (that) {
        that.id = that.getId(that.url);
    }(this);
}

function Data(id) {
    this.id = id;
    this.params;
    this.getParams = function (pid) {
        var pid = (typeof pid === "undefined" || pid === "") ? 0 : pid;
        return params = {
            parentId: pid
            , url: Services.base + Services.items.replace(/{pid}/gi, pid)
            , childrenUrl: Services.base + Services.query
            , template: $("#items-template").html()
            , childrenTemplate: $("#children-template").html()
            , data: null
            , container: $("#panels")
        };
    };
    this.loadParent = function (params) {
        var o = this;
        $.ajax({
            url: params.url
            , success: function (d) {
                params.data = d;
                var templateHtml = o.compileTemplate(params.template, d);
                params.container.html(templateHtml).promise().done(function () {
                    o.loadChildren(params, d);
                });
            }
        });
        return params;
    };
    this.loadChildren = function (params, data) {
        var o = this;
//        console.log(data);
        $.each(data, function () {
            var id = this.id;
            var url = this.url;
            $.ajax({
                url: url
                , success: function (d) {
                    var templateHtml = o.compileTemplate(params.childrenTemplate, d);
                    $("ul#items-" + id).html(templateHtml).promise().done(function () {
                        createCarousel($("ul#items-" + id));
                    });
                }
            });
        });

        return params;
    };
    this.compileTemplate = function (tmpl, data) {
        var template = Handlebars.compile(tmpl);
        var html = template(data);
        return html;
    };
    this.updateBreadcrumbs = function () {
        var urlParts = Location.get().split('/');
        $("#breadcrumbs ol").empty();
        if (urlParts.length > 3) {
            for (var i = 0; i < urlParts.length; i++) {
                urlParts.pop();
                link = '<li><a class="page" href="' + urlParts.join('/') + '">' + urlParts[urlParts.length - 1].split('-')[1] + '</a></li>';
                $("#breadcrumbs ol").prepend(link);
            }
        }
    };

    var __construct = function (that) {
        that.params = that.getParams(id);
        that.loadParent(that.params);
        that.updateBreadcrumbs();
    }(this);
}

$(function () {
    App.start();

    $(document).on('click', "a.page", function (e) {
        var o = Global.getLinkParams($(this));
        App.navigate(o);
        e.preventDefault();
    });

    $(document).on('click', "[data-toggle]", function (e) {
        var target = $(this).attr('data-target');
        if (target.indexOf('$this') !== -1) {
            target = target.replace("$this ", "");
            var $target = $(target).parents(".panel:first").find(target);
        } else
            var $target = $(target);

        switch ($(this).attr('data-toggle')) {
            case 'class':
                $target.toggleClass($(this).attr('data-value'));
                break;
            case 'toggle':
                if ($target.is(':hidden'))
                    $target.show().addClass('active');
                else
                    $target.hide().removeClass('active');
                break;
            case 'slide':
                if ($target.is(':hidden'))
                    $target.slideDown().addClass('active');
                else
                    $target.slideUp().removeClass('active');
                break;
            case 'fade':
                if ($target.is(':hidden'))
                    $target.fadeIn().addClass('active');
                else
                    $target.fadeOut().removeClass('active');
                break;
        }
        e.preventDefault();
    });

    $(document).on('submit', ".login-form", function (e) {
        var data = $(this).serializeObject();
        $.ajax({
            url: Services.login
            , type: 'GET'
            , dataType: 'jsonp'
            , data: data
            , success: function (data) {
                if (typeof data[0].token !== "undefined" && data[0].token !== "")
                    Cookie.set(data[0].token, '/');
            }
        });
        e.preventDefault();
    });

    $(document).on('click', ".carousel .item", function (e) {
        var $item = $(this);
        var $li = $(this).find("li:first");
        var $info = $item.parents(".panel").find(".item-info");
        if ($item.hasClass('preview')) {
            $info.slideUp(function () {
                // empty info
                $item.removeClass('preview');
            });
            return;
        }
        $item.parent().find(".item").removeClass("preview");
        $item.addClass('preview');
        var id = $(this).find("li[data-id]").attr('data-id');
        
        // load item id
        $info.find('.poster img').attr('src', $li.attr('data-image'));
        $info.find('a.play').attr('href', $li.attr('data-media'));
        $info.find('.details h3 a').text($li.find("h3").text());
        $info.find('.details p').text($li.attr('data-summary'));
        $info.find('.meta .date').text($li.find('.date').text());
        
        if (!$info.is(":visible"))
            $info.slideDown();
    });

    $(document).on('click', ".search button[role=close]", function (e) {
        $(".search").fadeOut();
        e.preventDefault();
    });

    $(document).scroll(function () {
        var offset = $(window).scrollTop();
        if (offset > 70)
            $("#header").addClass("opaque");
        else
            $("#header").removeClass("opaque");
    });
});
function responsive_resize() {
    var current_width = $(window).width();
    if (current_width < 768) {
        // XS
        $('body').addClass("_xs").removeClass("_sm _md _lg");
    } else if (current_width > 767 && current_width < 992) {
        $('body').addClass("_sm").removeClass("_xs _md _lg");
    } else if (current_width > 991 && current_width < 1200) {
        $('body').addClass("_md").removeClass("_xs _sm _lg");
    } else if (current_width > 1199) {
        $('body').addClass("_lg").removeClass("_xs _sm _md");
    }
}

function createCarousel($carousel) {
    if (!$carousel.length)
        return false;

//    $carousels.each(function () {
    $carousel.owlCarousel({
        responsive: {
            1199: {items: 5}
            , 996: {items: 4}
            , 768: {items: 3}
            , 0: {items: 2}
        }
        , items: 5
        , nav: true
//            , navContainer: $nav
        , navContainerClass: 'pagers'
        , navClass: ['prev', 'next']
        , navText: ['', '']
        , loop: true
        , themeClass: 'carousel-theme'
        , baseClass: 'carousel'
        , itemClass: 'item'
        , dots: false
    });
//    });
}