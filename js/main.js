$(function () {
    
    $(document).on('click', "[data-toggle]", function (e) {
        var $target = $($(this).attr('data-target'));
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
    
    $(document).on('click', ".carousel .item", function(e) {
        var $item = $(this);
        var $info = $item.parents(".panel").find(".item-info");
        if ($item.hasClass('preview')) {
            $info.slideUp(function() {
                // empty info
                $item.removeClass('preview');
            });
            return;
        }
        $item.parent().find(".item").removeClass("preview");
        $item.addClass('preview');
        var id = $(this).find("li[data-id]").attr('data-id');
        // load item id
        if (!$info.is(":visible"))
            $info.slideDown();
    });

    $(".is-carousel").each(function () {
        $(this).find("ul").owlCarousel({
            responsive: {
                1199: {items: 5}
                , 996: {items: 4}
                , 768: {items: 3}
                , 480: {items: 2}
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
//        $(this).find("ul").on('click', ".item", function (e) {
//            $(this).toggleClass('preview');
//        });
    });
    
    $(document).scroll(function() {
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
responsive_resize();
$(window).resize(function () { // Change width value on user resize, after DOM
    responsive_resize();
});